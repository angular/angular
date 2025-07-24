const $_c2$ = [[["special"]], "*"];
const $_c3$ = ["special", "*"];
…
decls: 4,
vars: 0,
consts: () => {
  __i18nMsgWithPostprocess__('{$startTagNgContent}{$closeTagNgContent}{$startTagNgContent_1}{$closeTagNgContent}', [['closeTagNgContent', String.raw`[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD]`], ['startTagNgContent', String.raw`\uFFFD#2\uFFFD`], ['startTagNgContent_1', String.raw`\uFFFD#3\uFFFD`]], {original_code: { 'closeTagNgContent': '</ng-content>', 'startTagNgContent': '<ng-content select=\"special\">', 'startTagNgContent_1': '<ng-content>' }}, {}, [])
  return [$i18n_0$];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵprojectionDef($_c2$);
    $r3$.ɵɵdomElementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵprojection(2);
    $r3$.ɵɵprojection(3, 1);
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵdomElementEnd();
  } 
}
