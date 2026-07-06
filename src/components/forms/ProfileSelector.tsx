import { createSignal, onMount, For, Show } from 'solid-js';
import { db, type Profile } from '../../store/db';

interface Props {
  onSelect: (profile: Profile) => void;
  locale: string;
}

export default function ProfileSelector(props: Props) {
  const [profiles, setProfiles] = createSignal<Profile[]>([]);
  const [open, setOpen] = createSignal(false);

  onMount(async () => {
    await loadProfiles();
  });

  const loadProfiles = async () => {
    try {
      const all = await db.profiles.toArray();
      // Sort by updatedAt in memory (avoids index issues)
      all.sort((a, b) => (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0));
      setProfiles(all);
    } catch (e) {
      console.warn('[ProfileSelector] Error loading profiles, trying to recover:', e);
      try {
        // If schema mismatch, delete and recreate
        await db.delete();
        await db.open();
        setProfiles([]);
      } catch (e2) {
        console.error('[ProfileSelector] Fatal DB error:', e2);
        setProfiles([]);
      }
    }
  };

  const selectProfile = (profile: Profile) => {
    props.onSelect(profile);
    setOpen(false);
  };

  const deleteProfile = async (e: Event, id: number) => {
    e.stopPropagation();
    if (confirm('Excluir este perfil?')) {
      await db.profiles.delete(id);
      await loadProfiles();
    }
  };

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setOpen(!open())}
        class="w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg border border-base-300 bg-base-200 text-cream-dark hover:bg-base-100 hover:border-base-400 transition-colors"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gold-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Perfis Salvos ({profiles().length})
        </span>
        <svg class={`w-4 h-4 text-muted transition-transform ${open() ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Show when={open()}>
        <div class="absolute z-30 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-dark max-h-64 overflow-y-auto">
          <Show when={profiles().length === 0}>
            <div class="px-4 py-3 text-sm text-muted text-center">
              Nenhum perfil salvo ainda
            </div>
          </Show>

          <For each={profiles()}>
            {(profile) => (
              <div
                onClick={() => selectProfile(profile)}
                class="flex items-center justify-between px-4 py-3 hover:bg-base-200 cursor-pointer border-b border-base-300/50 last:border-0 transition-colors"
              >
                <div>
                  <div class="text-sm font-medium text-cream">
                    {profile.name || 'Sem nome'}
                  </div>
                  <div class="text-xs text-muted">
                    {profile.date} {profile.time} • {profile.city}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => deleteProfile(e, profile.id!)}
                  class="p-1.5 text-muted hover:text-red-400 transition-colors rounded hover:bg-base-300/30"
                  title="Excluir"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

// ============================================================
// HELPER: Save a profile to IndexedDB
// ============================================================

export async function saveProfile(data: {
  name: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  timezone: number;
}): Promise<number> {
  const existing = await db.profiles
    .where('name').equals(data.name || '')
    .filter(p => p.date === data.date && p.time === data.time)
    .first();

  if (existing) {
    await db.profiles.update(existing.id!, {
      ...data,
      updatedAt: new Date(),
    });
    return existing.id!;
  }

  return await db.profiles.add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
