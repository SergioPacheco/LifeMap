export const learn = {
  title: '占星術を学ぶ',
  subtitle: '初心者から上級者まで対応した完全ガイド。天の言語の基礎を理解しましょう。',
  sections: [
    { slug: 'first-steps', icon: '🌟', title: '最初のステップ', description: '出生図とは？占星術はどのように機能するか？ここから始めましょう。' },
    { slug: 'planets', icon: '☉ ☽ ♃', title: '惑星', description: '太陽、月、水星から冥王星まで——各惑星があなたのホロスコープで何を意味するか。' },
    { slug: 'signs', icon: '♈ ♉ ♊', title: '12星座', description: '元素、モード、各黄道星座のユニークなエネルギー。' },
    { slug: 'houses', icon: '🏠', title: '12ハウス', description: '人生の領域——ホロスコープで惑星が働く場所。' },
    { slug: 'aspects', icon: '△ □ ☍', title: 'アスペクト', description: '惑星間の対話——調和、緊張、そして可能性。' },
    { slug: 'chiron', icon: '⚷', title: 'キロン——傷ついた癒し手', description: '贈り物となる傷：ホロスコープにおけるキロンの役割を理解する。' },
    { slug: 'planetary-cycles', icon: '🔄', title: '惑星サイクル', description: '土星回帰、中年の危機、そして人生の大きな節目。' },
    { slug: 'new-moon', icon: '🌑', title: '新月', description: 'ルネーションを使って意図を植え、新しいサイクルを始める方法。' },
  ],
  premiumCta: { icon: '📄', title: 'パーソナルレポート', description: 'より深く知りたいですか？PDFレポートでホロスコープの深い解釈をお届けします。' },
  firstSteps: {
    title: '占星術の最初のステップ',
    whatIsChart: { title: '出生図とは？', text: '出生図（またはネイタルチャート）は、生まれた瞬間に生まれた場所から見た空のスナップショットです。3つのデータが必要：生年月日、時間、出生地。' },
    notJustSun: { title: 'あなたは太陽星座だけではありません！', text: '"あなたの星座は何ですか？"と聞かれるとき、それは太陽がどこにあったかだけを聞いています。しかしあなたのホロスコープには10の惑星があり、それぞれ異なるサインとハウスにあります。', big3: { title: '"ビッグ3" — あなたの基本三位一体：', sun: '太陽 — あなたが誰であるか（アイデンティティ、自我）', moon: '月 — どのように感じるか（感情、ニーズ）', asc: 'アセンダント — どのように見えるか（社会的マスク、身体）' } },
    threeIngredients: { title: 'ホロスコープの3つの要素', planets: { label: '惑星', desc: '何——心理的機能' }, signs: { label: '星座', desc: 'どのように——スタイル、エネルギーの質' }, houses: { label: 'ハウス', desc: 'どこに——人生の領域' }, example: '例：「火星（行動）双子座（コミュニケーション）第10ハウス（キャリア）」= 職業的コミュニケーションを通じて行動する人。' },
    determinism: { title: '占星術は宿命論か？', text: 'いいえ。ホロスコープは可能性を示し、固定された運命ではありません。土のようなもの：何でも植えられますが、土の種類によって何が最も育ちやすいかが変わります。' },
    nextSteps: { title: '次のステップ', chart: '出生図を計算する', chartSub: '無料、即時、登録不要', planets: '惑星を理解する', signs: '12星座を発見する', houses: '12ハウス' },
  },
};
