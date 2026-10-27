// The code excerpts' colours, from the board's own tokens (global.css), on the raised tone they sit on inside a card.
// Each passes WCAG AA on #183539: silk 11.6, dim 6.1, gold 6.8, mint 8.9 (the gate's contrast check holds them to it).
const RAISED = '#183539', SILK = '#eaf2f1', DIM = '#9db6b8', GOLD = '#d8b46a', MINT = '#86e3bd';

export const codeTheme = {
  name: 'board',
  type: 'dark' as const,
  colors: { 'editor.background': RAISED, 'editor.foreground': SILK },
  tokenColors: [
    { settings: { foreground: SILK, background: RAISED } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: DIM, fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.other', 'meta.preprocessor', 'punctuation.definition.directive'], settings: { foreground: GOLD } },
    { scope: ['string', 'constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: MINT } },
  ],
};
