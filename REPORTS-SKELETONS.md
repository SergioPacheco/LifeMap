# Esqueletos de Implementação — Relatórios LifeMap Pro

> Documento de referência: como implementar cada relatório do CATALOG.md
> Gerado: 2026-07-07

---

## Status Atual

### ✅ JÁ IMPLEMENTADOS (9 relatórios com PDF funcional)
1. **Mapa Natal Completo** — `pdf-generator.ts`
2. **Previsão Anual** — `report-generators.ts`
3. **Relacionamento/Sinastria** — `report-generators.ts`
4. **Análise Psicológica** — `report-generators.ts`
5. **Carreira e Vocação** — `report-generators.ts`
6. **Sete Pecados** — `report-generators.ts`
7. **Mapa Financeiro** — `financial-report.ts` (87KB)
8. **Mapa Espiritual/Kármico** — `spiritual-report.ts` (79KB)
9. **Retorno de Saturno** — `saturn-return-report.ts` (72KB)

### Engine disponível
- Cálculo natal completo (posições, casas, aspectos, dignidades)
- Sinastria (aspectos cruzados A↔B)
- Mapa Composto (midpoints)
- Progressões Secundárias + Solar Arc
- Trânsitos (posições para qualquer data)
- Revolução Solar

### Engine NÃO disponível (precisa implementar)
- Revolução Lunar (retorno da Lua ao grau natal)
- Retorno planetário genérico (Júpiter, Vênus, Marte)
- Mapa Davison (midpoint tempo+espaço)
- Relocação (recálculo de casas para coordenadas diferentes)
- Astrocartografia (projeção de linhas planetárias em mapa)
- Astrologia Eletiva (busca de datas ótimas)

---

## 1. MAPA INFANTIL (Criança)

### O que é
Leitura do mapa natal da criança com linguagem 100% positiva, focada em potencial, temperamento e necessidades — sem rótulos negativos.

### Técnica astrológica
- **Mesmo cálculo do Natal** — não precisa de engine nova
- Foco em: Lua (necessidades emocionais), Mercúrio (aprendizado), ASC (temperamento), Casa 4 (família), Casa 5 (criatividade)
- Aspectos tensos viram "desafios de crescimento"
- Saturno vira "onde precisa de estrutura", não "limitação"
- Planetas exteriores (Urano, Netuno, Plutão) → influências geracionais, tratar levemente

### Diferença vs Natal adulto
| Natal Adulto | Infantil |
|---|---|
| "Tendência a isolamento" | "Precisa de momentos de quietude para recarregar" |
| "Conflitos de autoridade" | "Aprende melhor quando entende o porquê das regras" |
| "Impulsividade" | "Energia abundante que precisa de canais criativos" |

### Seções do relatório (~15 páginas)
1. **Temperamento Geral** — Sol + ASC + Lua (trindade básica)
2. **Mundo Emocional** — Lua no signo/casa + aspectos à Lua
3. **Como Aprende** — Mercúrio signo/casa + Casa 3
4. **Criatividade e Brincadeira** — Casa 5 + Vênus
5. **Relacionamento com Autoridade** — Saturno + Casa 10
6. **Vida Social** — Casa 11 + Casa 7 + Vênus
7. **Necessidades Físicas** — Marte + ASC (energia/corpo)
8. **Dons Especiais** — Aspectos harmônicos + planetas angulares
9. **Dicas para os Pais** — Síntese prática por área

### Implementação
```
Esforço: BAIXO (2-3 dias)
Engine: Nenhum novo — usa NatalChart existente
Arquivo: src/reports/child-report.ts
Textos: Reescrever interpretações do natal com tom positivo/parental
Dados de entrada: NatalChart + idade da criança (para contextualizar)
```

### Regras de ouro
- ZERO palavras negativas (nunca "difícil", "problemático", "agressivo")
- Sempre oferecer solução/dica prática para os pais
- Tratar aspectos tensos como "áreas que pedem atenção especial"
- Planetas retrógrados = "ritmo próprio", não "atraso"

---

## 2. MAPA FINANCEIRO

### O que é
Análise do perfil de abundância, estilo de ganho, relação com dinheiro e ciclos financeiros.

### Status: ✅ JÁ IMPLEMENTADO (`financial-report.ts` — 87KB)

### Técnica (para referência)
- **Casa 2** — renda pessoal, valores, como ganha dinheiro
- **Casa 8** — recursos compartilhados, heranças, investimentos, dívidas
- **Casa 11** — ganhos por networking, amigos, projetos coletivos
- **Vênus** — atração de recursos, estilo de valorização
- **Júpiter** — expansão financeira, onde a abundância cresce
- **Saturno** — disciplina, limitações, construção lenta
- **Regente da Casa 2** — planeta que "governa" sua forma de ganhar
- **Plutão na Casa 2 ou 8** — transformações financeiras radicais

### Seções típicas
1. Perfil financeiro geral (elemento dominante → estilo)
2. Como você ganha (Casa 2 + regente)
3. Talentos monetizáveis (Vênus + Júpiter + aspectos)
4. Riscos e armadilhas (Saturno + Netuno em casas financeiras)
5. Investimentos e recursos compartilhados (Casa 8)
6. Ciclos de abundância (trânsitos por Casa 2/8)

---

## 3. MAPA ESPIRITUAL / KÁRMICO

### O que é
Mapa da jornada da alma: vidas passadas, lições kármicas, propósito espiritual e dons mediúnicos.

### Status: ✅ JÁ IMPLEMENTADO (`spiritual-report.ts` — 79KB)

### Técnica (para referência)
- **Nodo Norte** — direção evolutiva, o que a alma busca aprender
- **Nodo Sul** — habilidades trazidas de vidas passadas, zona de conforto
- **Casa 12** — inconsciente, karma oculto, conexão com o todo
- **Saturno** — dívidas kármicas, lições de responsabilidade
- **Quíron** — ferida sagrada que se torna dom de cura
- **Netuno** — espiritualidade, intuição, mediunidade
- **Plutão** — transformação profunda, morte/renascimento
- **Planetas retrógrados** — assuntos inacabados de vidas anteriores

### Seções típicas
1. Eixo Nodal (Norte/Sul) — de onde vem, para onde vai
2. Lições de Saturno — karma de responsabilidade
3. Ferida de Quíron — onde dói e onde cura
4. Casa 12 — o inconsciente coletivo e espiritual
5. Dons intuitivos (Netuno, Lua, Casa 8/12)
6. Padrões de repetição (aspectos karmas)
7. Caminho de evolução — síntese e práticas sugeridas

---

## 4. PREVISÃO MENSAL (Revolução Lunar)

### O que é
Mapa erguido para o momento exato em que a Lua retorna ao seu grau natal (~27.3 dias). "Clima emocional" do mês.

### Técnica astrológica
- A Lua volta ao grau natal a cada **27.3 dias** (mês sideral)
- O mapa é erguido para o **momento exato** do retorno, na **localização atual** da pessoa
- Funciona como mini Revolução Solar: ASC da RL define o tema do mês
- Planetas nas casas da RL mostram ênfases do período
- Aspectos dentro da RL indicam facilidades/tensões

### O que precisa no engine (NOVO)
```typescript
// Nova função necessária
function calculateLunarReturn(
  natalMoonLongitude: number,  // Grau da Lua natal
  startDate: Date,              // Início da busca
  location: { lat: number, lng: number, timezone: number }
): {
  exactMoment: Date;           // Momento exato do retorno
  chart: NatalChart;           // Mapa erguido para esse momento+local
}
```

**Algoritmo:**
1. Calcular posição da Lua natal (já disponível)
2. A partir de `startDate`, iterar dia a dia calculando posição da Lua em trânsito
3. Quando Lua transitante cruzar o grau natal → refinar por interpolação (Newton-Raphson ou bisseção)
4. Erguer mapa completo para esse momento exato + coordenadas atuais

### Seções do relatório (~10-12 páginas)
1. **Tema do Mês** — ASC da Revolução Lunar + signo
2. **Foco Emocional** — Lua da RL na casa
3. **Ação e Energia** — Marte/Sol na RL
4. **Relacionamentos** — Vênus/Casa 7 da RL
5. **Trabalho** — Saturno/Casa 10 da RL
6. **Semana a semana** — trânsitos da Lua por cada quadrante da RL
7. **Alertas** — aspectos tensos da RL + datas sensíveis

### Implementação
```
Esforço: MÉDIO (4-5 dias)
Engine novo: findLunarReturn() — busca do momento exato
Arquivo: src/reports/monthly-report.ts
Dependência: Swiss Ephemeris (já usa via sweph-provider.ts)
Input: NatalChart + data de referência + localização atual
```

---

## 5. RETORNO DE SATURNO

### Status: ✅ JÁ IMPLEMENTADO (`saturn-return-report.ts` — 72KB)

### Técnica (para referência)
- Saturno leva **~29.5 anos** para completar uma volta
- 1º retorno: ~28-30 anos (entrada na vida adulta)
- 2º retorno: ~57-60 anos (maturidade/reinvenção)
- 3º retorno: ~87-90 anos (sabedoria/legado)
- O mapa é erguido para o momento exato da conjunção Saturno trânsito = Saturno natal

---

## 6. RETORNO DE JÚPITER

### O que é
Ciclo de expansão, sorte e crescimento (~12 anos). Cada retorno marca um "novo capítulo de abundância".

### Técnica astrológica
- Júpiter leva **~11.86 anos** para uma volta completa
- Retornos: ~12, ~24, ~36, ~48, ~60, ~72 anos
- O mapa é erguido para o momento exato da conjunção Júpiter trânsito = Júpiter natal
- Temas: expansão, viagens, educação, fé, oportunidades

### O que precisa no engine (NOVO — compartilhado com outros retornos)
```typescript
// Função genérica de retorno planetário
function findPlanetaryReturn(
  planet: PlanetId,              // 'jupiter' | 'venus' | 'mars' | etc.
  natalLongitude: number,        // Grau natal do planeta
  startDate: Date,               // Início da busca
  location: { lat: number, lng: number, timezone: number }
): {
  exactMoment: Date;
  chart: NatalChart;             // Mapa do retorno
}
```

**Algoritmo:**
1. Obter longitude natal do planeta
2. Calcular efemérides do planeta a partir de `startDate`
3. Encontrar momento em que longitude transitante = longitude natal (iteração + refinamento)
4. Erguer mapa para esse momento + local atual

### Seções do relatório (~12-15 páginas)
1. **O Ciclo de Júpiter na sua vida** — histórico de retornos passados
2. **Onde Júpiter expande** — casa natal de Júpiter
3. **Mapa do Retorno** — ASC, casa do Sol, planetas angulares
4. **Oportunidades do ciclo** — Casa 9, Casa 2, Casa 10 da carta de retorno
5. **Quando agir** — trânsitos de Júpiter pelas casas (12 meses do ciclo)
6. **Riscos de excesso** — aspectos tensos de Júpiter (inflação, excesso de confiança)
7. **Síntese prática** — recomendações por área da vida

### Implementação
```
Esforço: MÉDIO (3-4 dias, reaproveita padrão do Saturn Return)
Engine novo: findPlanetaryReturn() — genérico (serve para todos)
Arquivo: src/reports/jupiter-return-report.ts
Input: NatalChart + localização atual
```

---

## 7. RETORNO DE VÊNUS

### O que é
Ciclo de amor, prazer, autoestima e estética (~1 ano, com padrão de 8 anos).

### Técnica astrológica
- Vênus leva **~224.7 dias** (~1 ano, considerando retrogradações)
- Padrão pentagonal: a cada **8 anos** Vênus retorna quase exatamente ao mesmo ponto
- Os retornos de 8 anos são os mais significativos (eco venusiano)
- Temas: amor, beleza, dinheiro, autoestima, prazer, arte

### Diferencial: padrão de 8 anos
- Retorno anual = ciclo curto (tom do ano para relacionamentos)
- Retorno de 8 anos = marco (transformação em como ama e se valoriza)
- Incluir ambos no relatório com pesos diferentes

### Seções do relatório (~10-12 páginas)
1. **Seu estilo de amar** — Vênus natal (signo + casa + aspectos)
2. **O ciclo atual** — mapa do retorno venusiano
3. **Amor e relacionamento** — Casa 7 + Vênus da carta de retorno
4. **Dinheiro e abundância** — Casa 2 da carta de retorno
5. **Beleza e autoexpressão** — Vênus + Casa 5
6. **Padrão de 8 anos** — comparação com ciclos anteriores
7. **Dicas práticas** — melhores períodos para namoro, compras, arte

### Implementação
```
Esforço: MÉDIO-BAIXO (2-3 dias, usa findPlanetaryReturn genérico)
Engine: findPlanetaryReturn('venus', ...)
Arquivo: src/reports/venus-return-report.ts
Input: NatalChart + localização atual
```

---

## 8. RETORNO DE MARTE

### O que é
Ciclo de energia, ação, coragem, conflito e desejo (~2 anos).

### Técnica astrológica
- Marte leva **~687 dias (~1.88 anos)** para completar uma volta
- Retornos: ~2, ~4, ~6... anos (aproximado)
- Temas: energia vital, motivação, conflitos, sexualidade, ação, esporte
- Marte retrógrado a cada ~2 anos pode complicar o momento exato

### Seções do relatório (~10-12 páginas)
1. **Seu estilo de ação** — Marte natal (signo + casa + aspectos)
2. **O novo ciclo de energia** — mapa do retorno marciano
3. **Onde canalizar a energia** — Casa do Marte na carta de retorno
4. **Conflitos potenciais** — aspectos tensos no mapa de retorno
5. **Sexualidade e desejo** — Marte + Vênus + Casa 8 do retorno
6. **Esportes e saúde física** — Marte + Casa 6
7. **Agenda de ação** — melhores meses para iniciar projetos

### Implementação
```
Esforço: MÉDIO-BAIXO (2-3 dias, usa findPlanetaryReturn genérico)
Engine: findPlanetaryReturn('mars', ...)
Arquivo: src/reports/mars-return-report.ts
Input: NatalChart + localização atual
```

---

## 9. SINASTRIA FAMILIAR

### O que é
Mesmo motor de sinastria, mas com contexto textual de família (pai-filho, mãe-filho, irmãos).

### Técnica astrológica
- **Mesmos cálculos** da sinastria amorosa (aspectos cruzados, planetas nas casas do outro)
- Diferença está na **interpretação**: foco em dinâmicas parentais, não românticas
- Lua-Lua = conexão emocional entre parente/filho
- Saturno de um na Lua do outro = autoridade/restrição
- Sol do pai no MC do filho = influência na vocação

### Diferença vs Sinastria Amorosa
| Sinastria Amorosa | Sinastria Familiar |
|---|---|
| Vênus-Marte = atração sexual | Vênus-Marte = conexão de valores/ação |
| Casa 7/8 = intimidade | Casa 4/10 = dinâmica autoridade/cuidado |
| Plutão = obsessão amorosa | Plutão = padrões de controle familiar |

### Seções do relatório (~12-15 páginas)
1. **Conexão emocional** — Lua↔Lua, Lua↔Vênus, Lua↔Sol
2. **Comunicação** — Mercúrio↔Mercúrio, Mercúrio↔Lua
3. **Autoridade e limites** — Saturno cruzado + Casa 10
4. **Padrões herdados** — Nodo Sul + Casa 4 cruzados
5. **Potencial de crescimento** — Júpiter cruzado + trígonos
6. **Pontos de atrito** — quadraturas e oposições com contexto familiar
7. **Dicas de convivência** — síntese prática

### Implementação
```
Esforço: BAIXO (2-3 dias — motor existe, só muda textos)
Engine: Nenhum novo — usa SynastryChart existente
Arquivo: src/reports/family-synastry-report.ts (ou -texts.ts)
Input: NatalChart A + NatalChart B + tipo de relação (pai/mãe/filho/irmão)
```

---

## 10. SINASTRIA PROFISSIONAL

### O que é
Compatibilidade para sociedade, parceria de negócios ou trabalho conjunto.

### Técnica astrológica
- Mesmos cálculos de sinastria
- Foco em: Saturno (compromisso), Mercúrio (comunicação), Casa 10 (carreira), Casa 6 (trabalho diário)
- Júpiter cruzado = oportunidades mútuas
- Saturno cruzado = confiabilidade e estrutura

### Seções do relatório (~10-12 páginas)
1. **Comunicação profissional** — Mercúrio↔Mercúrio
2. **Confiança e compromisso** — Saturno cruzado
3. **Visão compartilhada** — Júpiter + Casa 9 cruzados
4. **Liderança e papéis** — Sol + Marte + Casa 10
5. **Finanças compartilhadas** — Casa 2/8 cruzadas + Vênus
6. **Riscos de conflito** — Marte↔Marte, Plutão cruzado
7. **Recomendação de papéis** — quem lidera, quem executa, quem vende

### Implementação
```
Esforço: BAIXO (2-3 dias — motor existe, só muda contexto textual)
Engine: Nenhum novo — usa SynastryChart existente
Arquivo: src/reports/professional-synastry-report.ts
Input: NatalChart A + NatalChart B
```

---

## 11. COMPATIBILIDADE SEXUAL

### O que é
Análise da química física, desejo, intimidade e atração entre duas pessoas.

### Técnica astrológica
- **Vênus-Marte** cruzados = atração clássica (o que atrai × como persegue)
- **Vênus-Plutão** = obsessão, magnetismo profundo
- **Marte-Plutão** = intensidade sexual extrema
- **Lua-Marte** = desejo emocional + físico
- **Casa 5** = prazer, romance, diversão
- **Casa 8** = sexo profundo, transformação, entrega
- **Lilith** = sexualidade selvagem, sombra erótica
- **ASC cruzados** = atração física instantânea

### Indicadores-chave de atração (scoring)
1. Vênus de A conjunção Marte de B (e vice-versa) — 10 pts
2. Marte de A na Casa 8 de B — 8 pts
3. Plutão de A em aspecto a Vênus de B — 8 pts
4. Lua de A aspecto Marte de B — 7 pts
5. ASC de A conjunção planetas de B — 6 pts
6. Casa 5 com stellium em sinastria — 5 pts

### Seções do relatório (~10-12 páginas)
1. **Atração à primeira vista** — ASC + Sol + Vênus cruzados
2. **Química Vênus-Marte** — como se desejam
3. **Profundidade (Plutão)** — intensidade e poder
4. **Intimidade emocional** — Lua + Casa 4/8
5. **Fantasia e criatividade** — Casa 5 + Netuno
6. **Sombra erótica** — Lilith + Plutão + Casa 8
7. **Compatibilidade de ritmo** — Marte↔Marte (velocidade/energia)
8. **Score geral + síntese**

### Implementação
```
Esforço: MÉDIO-BAIXO (3-4 dias — motor existe, textos específicos novos)
Engine: Nenhum novo — usa SynastryChart + posições de Lilith (já existe)
Arquivo: src/reports/sexual-compatibility-report.ts
Input: NatalChart A + NatalChart B
```

---

## 12. MAPA DAVISON

### O que é
O "mapa de nascimento da relação" — calcula um ponto médio no TEMPO e no ESPAÇO entre dois nascimentos e ergue um mapa natal para esse momento/local fictício.

### Técnica astrológica
- **Data Davison** = (data_A + data_B) / 2 (ponto médio temporal)
- **Hora Davison** = (hora_A + hora_B) / 2
- **Local Davison** = midpoint geográfico (lat_A+lat_B)/2, (lng_A+lng_B)/2
- Ergue-se um mapa natal REAL para essa data/hora/local
- Diferente do Composto (que usa midpoints de longitudes planetárias)
- O Davison tem ASC e MC verdadeiros → permite interpretação de casas

### O que precisa no engine (NOVO)
```typescript
function calculateDavisonChart(
  birthA: BirthData,
  birthB: BirthData,
  options?: CalculationOptions
): NatalChart {
  // 1. Calcular data média
  const midDate = new Date((dateA.getTime() + dateB.getTime()) / 2);
  // 2. Calcular hora média (ajustando timezone)
  // 3. Calcular local médio (lat/lng)
  const midLat = (birthA.lat + birthB.lat) / 2;
  const midLng = (birthA.lng + birthB.lng) / 2;
  // 4. Erguer mapa natal para midDate + midLocation
  return calculateNatalChart({ date: midDate, lat: midLat, lng: midLng, ... });
}
```

### Seções do relatório (~12-15 páginas)
1. **A essência da relação** — Sol + Lua + ASC do Davison
2. **Propósito conjunto** — Casa 10 + MC
3. **Comunicação do casal** — Mercúrio + Casa 3
4. **Amor e afeto** — Vênus + Casa 5/7
5. **Desafios** — Saturno + Plutão + aspectos tensos
6. **Potencial de crescimento** — Júpiter + Nodo Norte
7. **Comparação com Composto** — complementam-se

### Implementação
```
Esforço: MÉDIO (3-4 dias)
Engine novo: calculateDavisonChart() — simples (midpoint + calculateNatalChart)
Arquivo: src/reports/davison-report.ts
Input: BirthData A + BirthData B
```

---

## 13. MAPA DE SAÚDE ASTROLÓGICA

### O que é
Correspondências simbólicas entre signos/planetas e partes do corpo. NÃO é diagnóstico médico.

### Técnica astrológica (Astrologia Médica)
- **ASC/signo ascendente** = constituição física geral
- **Casa 6** = saúde diária, rotina, digestão
- **Casa 12** = doenças crônicas, hospitalização, saúde mental
- **Sol** = vitalidade geral
- **Lua** = saúde emocional, fluidos, ciclos
- **Saturno** = pontos de rigidez, ossos, articulações, cronificação

### Tabela signo → corpo (melothesia)
| Signo | Região do corpo |
|---|---|
| Áries | Cabeça, rosto, cérebro |
| Touro | Garganta, tireoide, pescoço |
| Gêmeos | Pulmões, braços, mãos, sistema nervoso |
| Câncer | Estômago, seios, útero |
| Leão | Coração, costas, circulação |
| Virgem | Intestinos, digestão, sistema nervoso |
| Libra | Rins, lombar, equilíbrio hormonal |
| Escorpião | Órgãos reprodutivos, bexiga, reto |
| Sagitário | Quadris, coxas, fígado |
| Capricórnio | Joelhos, ossos, pele, dentes |
| Aquário | Tornozelos, circulação, sistema nervoso |
| Peixes | Pés, sistema linfático, glândula pineal |

### Seções do relatório (~12-15 páginas)
1. **Constituição geral** — ASC + Sol + elemento dominante
2. **Pontos de atenção** — planetas em signos + tabela melothesia
3. **Vitalidade** — Sol + aspectos ao Sol
4. **Saúde emocional** — Lua + Casa 4/12
5. **Rotina e autocuidado** — Casa 6 + regente
6. **Cronificação** — Saturno + Casa 6/12
7. **Recomendações holísticas** — exercícios, alimentação, práticas por elemento
8. **Disclaimer** — "Correlações simbólicas, não substituem médico"

### Implementação
```
Esforço: BAIXO-MÉDIO (3-4 dias — motor existe, textos de melothesia novos)
Engine: Nenhum novo — usa NatalChart existente
Arquivo: src/reports/health-report.ts
Input: NatalChart
```

### Regra de ouro
- **NUNCA diagnosticar** — "tendência constitucional", "ponto de atenção"
- **NUNCA prescrever** — "pode se beneficiar de", "considere explorar"
- Sempre incluir disclaimer legal

---

## 14. MAPA FAMILIAR

### O que é
Análise dos padrões familiares, ancestralidade e dinâmicas de lar através do mapa natal individual.

### Técnica astrológica
- **Casa 4** = lar, família de origem, mãe (em algumas tradições), raízes
- **Casa 10** = pai (em algumas tradições), figura de autoridade
- **Lua** = mãe, nutrição, memória emocional
- **Sol** = pai, modelo masculino
- **Saturno** = padrões herdados, limites familiares, karma ancestral
- **IC (fundo do céu)** = base psicológica, herança emocional
- **Casa 4 em signo** = tipo de ambiente doméstico que busca/precisa

### Seções do relatório (~12-15 páginas)
1. **Raízes e ancestralidade** — IC + signo na Casa 4
2. **Figura materna** — Lua + aspectos + Casa 4
3. **Figura paterna** — Sol + Saturno + Casa 10
4. **Padrões herdados** — Saturno + Plutão + Nodo Sul em contexto familiar
5. **O lar que você cria** — Casa 4 + planetas nela
6. **Relação com irmãos** — Casa 3 + Mercúrio
7. **Ciclos familiares** — trânsitos pela Casa 4
8. **Rompendo padrões** — Urano + Nodo Norte como liberação

### Implementação
```
Esforço: BAIXO (2-3 dias — motor existe, foco em textos novos)
Engine: Nenhum novo — usa NatalChart existente
Arquivo: src/reports/family-report.ts
Input: NatalChart
```

---

## 15. MAPA DE TALENTOS

### O que é
Foco nos aspectos positivos: dons naturais, habilidades inatas, onde brilha com facilidade.

### Técnica astrológica
- **Aspectos harmônicos** — trígonos e sextis (fluxo natural)
- **Planetas angulares** — planetas em Casa 1/4/7/10 (destaque)
- **Sol + Casa 5** = criatividade e autoexpressão
- **Vênus** = talentos artísticos, estéticos, sociais
- **Júpiter** = onde expande com facilidade
- **Mercúrio** = habilidades intelectuais e comunicativas
- **Casa 2** = talentos que geram valor/renda
- **Stelliums** = concentração de energia = talento por intensidade

### Seções do relatório (~10-12 páginas)
1. **Seus dons naturais** — trígonos e sextis mais exatos
2. **Onde você brilha** — planetas angulares + dignidades (domicílio/exaltação)
3. **Criatividade** — Sol + Casa 5 + Vênus
4. **Intelecto** — Mercúrio + Casa 3/9
5. **Liderança** — Sol + Marte + Casa 10
6. **Habilidades sociais** — Vênus + Casa 7/11
7. **Talentos monetizáveis** — Casa 2 + link com Carreira
8. **Como desenvolver** — aspectos de potencial (sextis = esforço consciente)

### Implementação
```
Esforço: BAIXO (2-3 dias — motor existe, filtrar só aspectos positivos)
Engine: Nenhum novo — usa NatalChart existente
Arquivo: src/reports/talents-report.ts
Input: NatalChart
```

---

## 16. MAPA DE PROPÓSITO DE VIDA

### O que é
Síntese existencial: para que você veio, qual sua missão, onde encontra significado.

### Técnica astrológica
- **Sol** = identidade essencial, vontade, propósito consciente
- **Nodo Norte** = direção evolutiva, missão da alma
- **MC (Meio do Céu)** = contribuição ao mundo, vocação
- **Regente do ASC** = planeta que "dirige" sua vida
- **Casa 9** = filosofia, sentido, expansão de consciência
- **Casa 10** = legado, contribuição pública
- **Júpiter** = onde encontra fé e significado
- **Plutão** = poder transformador, onde exerce impacto profundo

### Seções do relatório (~12-15 páginas)
1. **Sua essência** — Sol no signo/casa
2. **Missão da alma** — Nodo Norte (signo + casa)
3. **Vocação pública** — MC + Casa 10 + regente
4. **O que você veio superar** — Nodo Sul + Saturno
5. **Onde encontra significado** — Casa 9 + Júpiter
6. **Poder de transformação** — Plutão + Casa 8
7. **Seu legado** — síntese Sol + Nodo Norte + MC
8. **Passos práticos** — recomendações para viver o propósito

### Implementação
```
Esforço: BAIXO (2-3 dias — motor existe, é uma síntese focada)
Engine: Nenhum novo — usa NatalChart existente
Arquivo: src/reports/purpose-report.ts
Input: NatalChart
```

---

## 17. ASTROCARTOGRAFIA

### O que é
Projeção das linhas planetárias sobre um mapa-múndi, mostrando onde cada planeta é angular (ASC, MC, DSC, IC) para a pessoa. Responde: "onde no mundo é melhor para mim morar/trabalhar/amar?"

### Técnica astrológica
- Criada por Jim Lewis nos anos 1970
- Para cada planeta, calcula-se em quais pontos da Terra ele estaria no ASC, MC, DSC ou IC no momento do nascimento
- Resultado: **4 linhas por planeta** cruzando o mapa-múndi
  - Linha ASC (leste): planeta no horizonte leste = identidade/presença
  - Linha DSC (oeste): planeta no horizonte oeste = relacionamentos
  - Linha MC (meridiano superior): planeta no zênite = carreira/fama
  - Linha IC (meridiano inferior): planeta no nadir = lar/raízes
- Linhas **Paran** = cruzamentos entre linhas de planetas diferentes

### O que precisa no engine (NOVO — COMPLEXO)
```typescript
interface AstrocartographyLine {
  planet: PlanetId;
  angle: 'ASC' | 'MC' | 'DSC' | 'IC';
  points: Array<{ lat: number; lng: number }>; // Série de pontos formando a curva
}

function calculateAstrocartography(
  birthDate: Date,
  birthTime: string,  // HH:mm
  timezone: number
): AstrocartographyLine[] {
  // Para cada planeta:
  //   Para cada grau de longitude (-180 a +180):
  //     Calcular qual latitude faz o planeta ficar angular
  //     Resultado = ponto na linha
  // Linhas MC/IC são verticais (mesmo meridiano)
  // Linhas ASC/DSC são curvas (dependem da latitude)
}
```

**Algoritmo simplificado:**
1. Fixar o momento do nascimento (posições planetárias fixas)
2. Para cada longitude geográfica (a cada 1-2°):
   - Calcular o RAMC (Right Ascension do MC) para aquele meridiano naquele instante
   - Para cada planeta: encontrar a latitude onde o planeta fica no ASC (resolve equação trigonométrica)
3. Plotar os pontos em um mapa (pode usar SVG ou Canvas)

### Seções do relatório (~15-20 páginas)
1. **Introdução ao conceito** — como funciona
2. **Suas melhores linhas** — Sol MC (sucesso), Vênus ASC (amor), Júpiter MC (sorte)
3. **Linhas desafiadoras** — Saturno, Plutão, Marte
4. **Para carreira** — linhas MC mais favoráveis
5. **Para amor** — linhas Vênus DSC, Lua ASC
6. **Para saúde** — evitar Marte/Saturno no ASC
7. **Cruzamentos importantes** — Parans
8. **Mapa visual** (SVG do mapa-múndi com linhas)
9. **Top 10 cidades recomendadas**

### Implementação
```
Esforço: ALTO (7-10 dias)
Engine novo: calculateAstrocartography() — trigonometria esférica
Visual: SVG map component (React/Solid)
Arquivo: src/engine/astrocartography.ts + src/reports/astrocartography-report.ts
Input: BirthData (só precisa dados de nascimento)
Dependência: Equações de RAMC, declinação, ascensão oblíqua
```

### Alternativa simplificada (MVP)
Em vez de desenhar linhas em mapa, gerar **lista de cidades** com score:
1. Para cada cidade importante (~200 cidades):
   - Recalcular casas para aquela coordenada
   - Verificar quais planetas ficam angulares
   - Gerar score e interpretação
2. Rankear por propósito (carreira, amor, saúde, etc.)

---

## 18. MAPA RELOCADO

### O que é
O mapa natal recalculado como se a pessoa tivesse nascido no local onde mora agora. Planetas ficam nos mesmos graus, mas as CASAS mudam.

### Técnica astrológica
- **Posições planetárias** = idênticas ao natal (mesmo momento no tempo)
- **Casas** = recalculadas para as novas coordenadas geográficas
- Resultado: planetas mudam de casa → muda a ênfase da vida
- Ex: Planeta que era Casa 12 (oculto) pode virar Casa 1 (destaque) em outra cidade

### O que precisa no engine (SIMPLES)
```typescript
function calculateRelocatedChart(
  natal: NatalChart,
  birthData: BirthData,
  newLocation: { lat: number; lng: number; timezone: number; city?: string }
): NatalChart {
  // 1. Manter todas as posições planetárias iguais
  // 2. Recalcular APENAS as casas para newLocation
  const newHouses = calculateFullHouses(natal.date, newLocation.lat, newLocation.lng, 'placidus');
  // 3. Reatribuir planetas às novas casas
  // 4. Recalcular aspectos a novos ângulos (ASC, MC)
}
```

### Seções do relatório (~12-15 páginas)
1. **O que muda e o que fica** — explicação do conceito
2. **Comparação lado a lado** — tabela natal vs relocado (planeta | casa natal | casa relocada)
3. **Novo ASC** — como o mundo te vê neste local
4. **Novo MC** — carreira e vocação neste local
5. **Destaques** — planetas que ganharam angularidade
6. **Áreas fortalecidas** — casas que ficaram mais populadas
7. **Áreas desafiadas** — planetas em casas difíceis (6, 8, 12)
8. **Veredicto** — este local favorece o quê na sua vida

### Implementação
```
Esforço: MÉDIO-BAIXO (2-3 dias)
Engine: calculateFullHouses() já existe! Só reorganizar planetHouses
Arquivo: src/reports/relocated-report.ts
Input: NatalChart + novas coordenadas
```

---

## 19. ASTROLOGIA ELETIVA

### O que é
Escolher a melhor data/hora para iniciar algo (casamento, empresa, viagem, lançamento). "Se você pode controlar o início, influencia o resultado."

### Técnica astrológica (regras tradicionais)
1. **Lua** = mais importante — deve estar em bom aspecto, crescente, não vazio de curso
2. **ASC/regente do ASC** = representa o empreendimento
3. **Casa relevante** forte: Casa 7 para casamento, Casa 10 para negócio, Casa 9 para viagem
4. **Evitar:** Mercúrio retrógrado, Lua vazio de curso, maléficos (Saturno/Marte) angulares
5. **Favorecer:** benéficos (Vênus/Júpiter) angulares ou aspectando a Lua

### Regras-chave para scoring de datas
| Regra | Peso |
|---|---|
| Lua crescente (não cheia) | +3 |
| Lua em aspecto harmônico a Vênus/Júpiter | +3 |
| Regente do ASC dignificado | +2 |
| Benéficos em casas angulares | +2 |
| Sem planetas retrógrados | +1 |
| Lua vazio de curso | -5 |
| Mercúrio retrógrado | -3 |
| Maléficos no ASC | -3 |
| Eclipse próximo (<5 dias) | -2 |

### O que precisa no engine (COMPLEXO)
```typescript
interface ElectionalResult {
  date: Date;
  score: number;
  chart: NatalChart;
  pros: string[];       // Aspectos favoráveis
  cons: string[];       // Aspectos desfavoráveis
  suitable_for: string[]; // Tipos de evento compatíveis
}

function findBestDates(
  purpose: 'wedding' | 'business' | 'travel' | 'launch' | 'surgery' | 'general',
  searchRange: { from: Date; to: Date },
  location: { lat: number; lng: number; timezone: number },
  natalChart?: NatalChart  // Opcional: conectar com trânsitos pessoais
): ElectionalResult[] {
  // 1. Para cada hora no range (a cada 1-2 horas):
  //    - Calcular posições + casas
  //    - Aplicar scoring baseado nas regras
  //    - Se score > threshold: adicionar à lista
  // 2. Rankear por score
  // 3. Retornar top N resultados
}
```

### Seções do relatório (~10-15 páginas)
1. **O que é astrologia eletiva** — introdução
2. **Seu objetivo** — regras específicas por tipo de evento
3. **Top 5 datas recomendadas** — com mapa e score
4. **Análise da melhor data** — mapa completo + interpretação
5. **Datas a evitar** — quando NÃO fazer
6. **Ajuste fino** — melhor hora dentro do melhor dia
7. **Conexão com seu natal** — trânsitos pessoais favoráveis

### Implementação
```
Esforço: ALTO (7-10 dias)
Engine novo: findBestDates() — iteração + scoring + otimização
Arquivo: src/engine/electional.ts + src/reports/electional-report.ts
Input: Propósito + range de datas + localização + NatalChart (opcional)
Performance: pode ser pesado (iterar horas em range de 30-90 dias)
```

### MVP simplificado
Em vez de buscar automaticamente, oferecer **validação de data**:
- Usuário escolhe 1-3 datas candidatas
- Sistema analisa cada uma e dá score/relatório
- Muito mais leve computacionalmente

---

## Resumo de Esforço

| # | Relatório | Engine novo? | Esforço | Prioridade sugerida |
|---|---|---|---|---|
| 1 | Mapa Infantil | ❌ | 2-3 dias | 🥇 Alta |
| 2 | Mapa Financeiro | ❌ | ✅ PRONTO | — |
| 3 | Espiritual/Kármico | ❌ | ✅ PRONTO | — |
| 4 | Previsão Mensal | ✅ Revolução Lunar | 4-5 dias | 🥇 Alta |
| 5 | Retorno de Saturno | ❌ | ✅ PRONTO | — |
| 6 | Retorno de Júpiter | ✅ findPlanetaryReturn | 3-4 dias | 🥈 Média |
| 7 | Retorno de Vênus | ✅ (reusa #6) | 2-3 dias | 🥈 Média |
| 8 | Retorno de Marte | ✅ (reusa #6) | 2-3 dias | 🥈 Média |
| 9 | Sinastria Familiar | ❌ | 2-3 dias | 🥇 Alta |
| 10 | Sinastria Profissional | ❌ | 2-3 dias | 🥈 Média |
| 11 | Compatibilidade Sexual | ❌ | 3-4 dias | 🥇 Alta |
| 12 | Mapa Davison | ✅ calculateDavison | 3-4 dias | 🥈 Média |
| 13 | Saúde Astrológica | ❌ | 3-4 dias | 🥈 Média |
| 14 | Mapa Familiar | ❌ | 2-3 dias | 🥉 Baixa |
| 15 | Mapa de Talentos | ❌ | 2-3 dias | 🥉 Baixa |
| 16 | Propósito de Vida | ❌ | 2-3 dias | 🥉 Baixa |
| 17 | Astrocartografia | ✅ COMPLEXO | 7-10 dias | 🔮 Futuro |
| 18 | Mapa Relocado | ✅ simples | 2-3 dias | 🥈 Média |
| 19 | Astrologia Eletiva | ✅ COMPLEXO | 7-10 dias | 🔮 Futuro |

### Total estimado: ~55-70 dias de trabalho para todos os pendentes

### Ordem de implementação sugerida

**Sprint 1 (sem engine novo — 2 semanas):**
- Mapa Infantil, Sinastria Familiar, Compatibilidade Sexual, Mapa de Talentos, Propósito de Vida

**Sprint 2 (engine findPlanetaryReturn — 2 semanas):**
- Retorno de Júpiter, Retorno de Vênus, Retorno de Marte

**Sprint 3 (engine Revolução Lunar + Davison — 2 semanas):**
- Previsão Mensal, Mapa Davison, Mapa Relocado

**Sprint 4 (engine complexo — 3 semanas):**
- Astrocartografia, Astrologia Eletiva

---

## Padrão de Implementação (Template)

Para cada novo relatório:

```typescript
// 1. Criar arquivo: src/reports/{nome}-report.ts
// 2. Estrutura padrão:

import { jsPDF } from 'jspdf';
import type { NatalChart } from '../engine/types';
import type { ReportOptions } from './report-generators';

// Textos interpretativos (ou importar de {nome}-texts.ts)
const INTERPRETATIONS = { ... };

// Função geradora principal
export function generate{Nome}Pdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF('p', 'mm', 'a4');

  // 1. Capa
  renderCover(doc, 'Título', 'Subtítulo', options, '🔮');

  // 2. Seções do relatório
  renderSection1(doc, chart, options);
  renderSection2(doc, chart, options);
  // ...

  // 3. Disclaimer + rodapé
  renderDisclaimer(doc);

  return doc.output('blob');
}

// 3. Registrar no payment.ts (PRODUCTS)
// 4. Adicionar ao ReportsShop.tsx (PRODUCTS_META)
// 5. Adicionar ao ReportPreview.tsx (reportType union)
// 6. Mapear no handler de download (onde chama a função)
```
