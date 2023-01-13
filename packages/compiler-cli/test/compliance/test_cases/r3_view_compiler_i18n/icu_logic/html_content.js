decls: 5,
vars: 1,
consts: function() {
  __i18nIcuMsg__('{VAR_SELECT, select, male {male - {START_BOLD_TEXT}male{CLOSE_BOLD_TEXT}} female {female {START_BOLD_TEXT}female{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}{START_ITALIC_TEXT}other{CLOSE_ITALIC_TEXT}{CLOSE_TAG_DIV}}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`], ['START_BOLD_TEXT', '<b>'], ['CLOSE_BOLD_TEXT', '</b>'], ['START_ITALIC_TEXT', '<i>'], ['CLOSE_ITALIC_TEXT', '</i>'], ['START_TAG_DIV', '<div class="other">'], ['CLOSE_TAG_DIV', '</div>']], {})
  __i18nMsg__(' {$icu} {$startBoldText}Other content{$closeBoldText}{$startTagDiv}{$startItalicText}Another content{$closeItalicText}{$closeTagDiv}', [['startBoldText', String.raw`\uFFFD#2\uFFFD`], ['closeBoldText', String.raw`\uFFFD/#2\uFFFD`], ['startTagDiv', String.raw`\uFFFD#3\uFFFD`], ['startItalicText', String.raw`\uFFFD#4\uFFFD`], ['closeItalicText', String.raw`\uFFFD/#4\uFFFD`], ['closeTagDiv', String.raw`\uFFFD/#3\uFFFD`], ['icu', '$I18N_1$', '4731057199984078679']], {original_code: {'startBoldText': '<b>', 'closeBoldText': '</b>', 'startTagDiv': '<div class="other">', 'startItalicText': '<i>', 'closeItalicText': '</i>', 'closeTagDiv': '</div>', 'icu': '{gender, select, male {male - <b>male</b>} female {female <b>female</b>} other {<div class="other"><i>other</i></div>}}'}}, {})
  return [
    $i18n_1$,
    [__AttributeMarker.Classes__, "other"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵelement(2, "b");
    $r3$.ɵɵelementStart(3, "div", 1);
    $r3$.ɵɵelement(4, "i");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵi18nExp(ctx.gender);
    $r3$.ɵɵi18nApply(1);
  }
}
