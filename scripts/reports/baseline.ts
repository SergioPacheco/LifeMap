import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { reportSubjects, displayNames } from '../../tests/fixtures/reports/profiles';

// Legacy generators require the browser DOM. Start Astro before running this script.
const origin = process.env.REPORT_BASELINE_ORIGIN || 'http://127.0.0.1:4321';
const outputDir = resolve(process.env.REPORT_BASELINE_DIR || '/tmp/lifemap-report-baseline');
const reportTypes = ['natal', 'annual', 'relationship', 'psychological', 'career', 'seven-sins', 'financial', 'spiritual', 'saturn-return'];
const locales = ['pt', 'en', 'es'];
interface Measurement {
  file: string; profile: number; reportType: string; locale: string; mode: string;
  pages: number; words: number; outOfPageWords: number; bottomMarginWords: number;
  wheelPlaceholder: boolean; portugueseMarkers: number; englishMarkers: number;
  generationMs: number; error?: string;
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${origin}/pt/reports/`, { waitUntil: 'networkidle' });
    const measurements: Measurement[] = [];
    const cases = locales.flatMap(locale => reportTypes.flatMap(reportType => ['sample', 'complete'].map(mode => ({ locale, reportType, mode, index: 0 }))));
    // The extra natal samples exercise all synthetic birth inputs and long names.
    cases.push(...reportSubjects.slice(1).map((_, i) => ({ locale: locales[(i + 1) % locales.length], reportType: 'natal', mode: 'sample', index: i + 1 })));
    for (const item of cases) {
      const file = `${item.reportType}-${item.locale}-${item.mode}-p${item.index + 1}.pdf`;
      const result = await page.evaluate(async ({ item, subjects, names }) => {
        const enginePath = '/src/engine/index.ts', natalPath = '/src/reports/pdf-generator.ts', otherPath = '/src/reports/report-generators.ts';
        const engine = await import(enginePath), natal = await import(natalPath), other = await import(otherPath);
        await engine.initSweph();
        const subject = subjects[item.index];
        // A noon reference solely lets the legacy baseline run unknown-time inputs.
        // This is NOT a known birth time or a contract for the new factual pipeline.
        const birth = { ...subject.birth, time: subject.birth.time || '12:00' };
        const chart = engine.calculateNatalChart(birth);
        const options = { locale: item.locale, isTryout: item.mode === 'sample', profileName: names[item.index % names.length], birthDate: birth.date, birthTime: subject.birth.time, birthCity: birth.city };
        const generators: Record<string, string> = { annual: 'generateAnnualPdf', relationship: 'generateRelationshipPdf', psychological: 'generatePsychologicalPdf', career: 'generateCareerPdf', 'seven-sins': 'generateSevenSinsPdf', financial: 'generateFinancialPdf', spiritual: 'generateSpiritualPdf', 'saturn-return': 'generateSaturnReturnPdf' };
        const started = performance.now();
        try {
          const blob: Blob = item.reportType === 'natal' ? natal.generateNatalPdf(chart, options) : other[generators[item.reportType]](chart, options);
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let binary = '';
          for (let offset = 0; offset < bytes.length; offset += 4096) binary += String.fromCharCode(...bytes.subarray(offset, offset + 4096));
          return { base64: btoa(binary), generationMs: Math.round(performance.now() - started), error: null };
        } catch (error) { return { base64: '', generationMs: Math.round(performance.now() - started), error: String(error) }; }
      }, { item, subjects: reportSubjects, names: displayNames });
      if (result.error) {
        measurements.push({ file, profile: item.index + 1, reportType: item.reportType, locale: item.locale, mode: item.mode, pages: 0, words: 0, outOfPageWords: 0, bottomMarginWords: 0, wheelPlaceholder: false, portugueseMarkers: 0, englishMarkers: 0, generationMs: result.generationMs, error: result.error });
        continue;
      }
      const path = join(outputDir, file);
      await writeFile(path, Buffer.from(result.base64, 'base64'));
      const info = execFileSync('pdfinfo', [path], { encoding: 'utf8' });
      const content = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8', maxBuffer: 10_000_000 });
      const bbox = execFileSync('pdftotext', ['-bbox', path, '-'], { encoding: 'utf8', maxBuffer: 10_000_000 });
      let outOfPageWords = 0, bottomMarginWords = 0;
      for (const match of bbox.matchAll(/<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/g)) {
        const width = Number(match[1]), height = Number(match[2]);
        for (const word of match[3].matchAll(/<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">/g)) {
          if (+word[1] < 0 || +word[2] < 0 || +word[3] > width || +word[4] > height) outOfPageWords++;
          if (+word[4] > height - 28.35) bottomMarginWords++; // Last 10 mm, including legitimate footers.
        }
      }
      measurements.push({ file, profile: item.index + 1, reportType: item.reportType, locale: item.locale, mode: item.mode,
        pages: Number(info.match(/^Pages:\s+(\d+)/m)?.[1]), words: content.trim().split(/\s+/u).length,
        outOfPageWords, bottomMarginWords, wheelPlaceholder: /view online for interactive version|veja online a versão interativa/i.test(content),
        portugueseMarkers: (content.match(/\b(?:você|seu|sua|não|mapa|relatório)\b/giu) || []).length,
        englishMarkers: (content.match(/\b(?:your|you|the|and|chart|report)\b/giu) || []).length, generationMs: result.generationMs });
      await writeFile(path.replace(/\.pdf$/, '.txt'), content);
    }
    await page.goto(`${origin}/es/reports/financial-sample/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(outputDir, 'financial-preview-es.png'), fullPage: true });
    // Compare the wheel in the DOM with the legacy PDF's placeholder.
    await page.evaluate(async birth => {
      const enginePath = '/src/engine/index.ts', wheelPath = '/src/renderer/wheel.ts';
      const engine = await import(enginePath), wheel = await import(wheelPath);
      document.body.innerHTML = wheel.renderWheel(engine.calculateNatalChart(birth));
      document.body.style.background = 'white';
    }, reportSubjects[0].birth);
    await page.screenshot({ path: join(outputDir, 'wheel-browser.png'), fullPage: true });
    execFileSync('pdftoppm', ['-f', '2', '-singlefile', '-scale-to', '1200', '-png', join(outputDir, 'natal-pt-complete-p1.pdf'), join(outputDir, 'natal-pdf-wheel')]);
    execFileSync('pdftoppm', ['-f', '1', '-singlefile', '-scale-to', '1200', '-png', join(outputDir, 'natal-es-sample-p12.pdf'), join(outputDir, 'long-name-cover')]);
    const measuredAt = new Date().toISOString();
    await writeFile(join(outputDir, 'measurements.json'), JSON.stringify({ measuredAt, origin, measurements }, null, 2));
    const rows = measurements.filter(row => row.profile === 1).map(row => `| ${row.reportType} | ${row.locale} | ${row.mode} | ${row.pages} | ${row.words} | ${row.outOfPageWords} | ${row.wheelPlaceholder ? 'sim' : 'não'} |`);
    const markdown = `# Baseline dos relatórios legados\n\nMedido em ${measuredAt} com Chromium, frontend local ${origin} e os geradores jsPDF existentes. Nenhuma chamada de IA. Artefatos: \`${outputDir}\` (PDFs, texto extraído, JSON e imagens).\n\n## Método e limites\n\n${measurements.length} PDFs: nove produtos × PT/EN/ES × amostra/completo, mais 23 amostras natais para cobrir os 24 perfis sintéticos. O perfil principal usa 29/02/1988, São Paulo, 06:15. Relacionamento foi medido sem parceiro, como o preview legado. Horários desconhecidos usam meio-dia apenas como referência para executar o gerador antigo; isso não valida suas casas/ângulos. O navegador usa o fallback do motor, sem addon nativo.\n\nPalavras são tokens separados por espaço extraídos com pdftotext; não equivalem a extensão editorial útil. Bounding boxes fora da página são evidência geométrica de overflow; extração pode omitir texto inteiramente cortado e não detecta toda sobreposição. Marcadores PT/EN no JSON são indícios para revisão de idioma, não uma classificação automática.\n\n## Medições do perfil principal\n\n| Produto | Locale | Modo | Páginas reais | Palavras extraídas | Palavras fora da página | Wheel placeholder |\n| --- | --- | --- | ---: | ---: | ---: | --- |\n${rows.join('\n')}\n\n## Evidências e pendências\n\n- PDFs com placeholder da wheel: ${measurements.filter(row => row.wheelPlaceholder).length}. Comparar wheel-browser.png e natal-pdf-wheel.png.\n- PDFs com palavras fora da página: ${measurements.filter(row => row.outOfPageWords > 0).length}; soma: ${measurements.reduce((sum, row) => sum + row.outOfPageWords, 0)}.\n- Falhas de geração: ${measurements.filter(row => row.error).length}.\n- Os arquivos .txt permitem verificar misturas de idioma e comparar a extensão realmente produzida.\n- Inspeção visual e exemplos específicos ficam registrados abaixo após revisão dos artefatos.\n`;
    await mkdir('docs/reports/baseline-assets', { recursive: true });
    await writeFile('docs/reports/baseline-measurements.json', JSON.stringify({ measuredAt, origin, measurements }, null, 2));
    for (const file of ['wheel-browser.png', 'natal-pdf-wheel.png', 'long-name-cover.png']) await copyFile(join(outputDir, file), join('docs/reports/baseline-assets', file));
    await writeFile('docs/reports/baseline.md', markdown);
    console.log(`Baseline: ${measurements.length} documentos, ${measurements.filter(row => row.error).length} falhas; ${outputDir}`);
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
