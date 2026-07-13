interface Props {
  pro?: boolean;
  class?: string;
  textClass?: string;
}

export default function BrandLogo(props: Props) {
  return (
    <span class={`inline-flex items-center gap-2.5 min-w-0 ${props.class ?? ''}`}>
      <span class="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gold/35 bg-gradient-to-br from-base-100 via-base-50 to-base shadow-gold">
        <svg
          class="h-6 w-6"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="16" cy="16" r="10.5" class="text-gold/70" stroke="currentColor" stroke-width="1.4" />
          <path d="M16 4.5V8.2M16 23.8v3.7M4.5 16h3.7M23.8 16h3.7" class="text-gold-light" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <path d="M16 8.2l2.5 5.4 5.4 2.4-5.4 2.4L16 23.8l-2.5-5.4L8.1 16l5.4-2.4L16 8.2Z" class="text-gold" fill="currentColor" />
          <path d="M10.5 21.7c2.9-2.3 6.2-3.2 9.9-9.2" class="text-air" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <circle cx="10.5" cy="21.7" r="1.2" class="text-cream" fill="currentColor" />
          <circle cx="20.4" cy="12.5" r="1.2" class="text-cream" fill="currentColor" />
        </svg>
      </span>
      <span class={`flex items-baseline gap-1 leading-none ${props.textClass ?? ''}`}>
        <span class="font-serif text-lg font-bold text-cream">LifeMap</span>
        {props.pro && <span class="text-[11px] font-semibold text-gold">Pro</span>}
      </span>
    </span>
  );
}
