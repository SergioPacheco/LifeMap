import { getTranslations, localePath, type Locale } from '../../i18n';
import BrandLogo from './BrandLogo';

interface Props {
  locale: Locale;
}

export default function Footer(props: Props) {
  const t = () => getTranslations(props.locale);

  return (
    <footer class="border-t border-white/[0.04] mt-16 bg-[#030305]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div class="flex items-center gap-2 mb-3">
              <BrandLogo pro />
            </div>
            <p class="text-sm text-muted">
              {t().site.description}
            </p>
          </div>

          {/* Charts */}
          <div>
            <h4 class="font-semibold text-sm uppercase tracking-wider text-cream-dark mb-3">
              {t().nav.charts}
            </h4>
            <ul class="space-y-2 text-sm">
              <li><a href={localePath('/chart/natal', props.locale)} class="text-muted hover:text-gold transition-colors">{t().nav.natal}</a></li>
              <li><a href={localePath('/chart/transits', props.locale)} class="text-muted hover:text-gold transition-colors">{t().nav.transits}</a></li>
              <li><a href={localePath('/chart/synastry', props.locale)} class="text-muted hover:text-gold transition-colors">{t().nav.synastry}</a></li>
              <li><a href={localePath('/chart/solar-return', props.locale)} class="text-muted hover:text-gold transition-colors">{t().nav.solarReturn}</a></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 class="font-semibold text-sm uppercase tracking-wider text-cream-dark mb-3">
              {t().nav.tools}
            </h4>
            <ul class="space-y-2 text-sm">
              <li><a href={localePath('/tools/ephemeris', props.locale)} class="text-muted hover:text-gold transition-colors">{t().nav.ephemeris}</a></li>
              <li><a href={localePath('/tools/moon-phases', props.locale)} class="text-muted hover:text-gold transition-colors">{t().nav.moonPhases}</a></li>
              <li><a href={localePath('/tools/retrogrades', props.locale)} class="text-muted hover:text-gold transition-colors">{t().nav.retrograde}</a></li>
            </ul>
          </div>

          {/* Premium */}
          <div>
            <h4 class="font-semibold text-sm uppercase tracking-wider text-cream-dark mb-3">
              {t().nav.reports}
            </h4>
            <ul class="space-y-2 text-sm">
              <li><a href={localePath('/reports', props.locale)} class="text-muted hover:text-gold transition-colors">{t().reports.natal}</a></li>
              <li><a href={localePath('/reports', props.locale)} class="text-muted hover:text-gold transition-colors">{t().reports.relationship}</a></li>
              <li><a href={localePath('/reports', props.locale)} class="text-muted hover:text-gold transition-colors">{t().reports.yearAhead}</a></li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-muted">
          <p>© {new Date().getFullYear()} LifeMap Pro. {t().site.subtitle}.</p>
          <p class="mt-1">100% client-side • No data stored on servers • Your data stays in your browser</p>
        </div>
      </div>
    </footer>
  );
}
