function AppComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
  }
  if (rf & 2) {
    const $ctx$ = i0.ɵɵnextContext();
    i0.ɵɵi18nExp($ctx$.name);
    i0.ɵɵi18nApply(0);
  }
}
function AppComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 2);
  }
}
…
i18n_0 = $localize `Before ${"\uFFFD*2:1\uFFFD"}:START_BLOCK_IF:shown ${"\uFFFD0:1\uFFFD"}:INTERPOLATION:${"\uFFFD/*2:1\uFFFD"}:CLOSE_BLOCK_IF:${"\uFFFD*3:2\uFFFD"}:START_BLOCK_ELSE:hidden${"\uFFFD/*3:2\uFFFD"}:CLOSE_BLOCK_ELSE: after`;
…
i0.ɵɵi18nStart(1, 0);
i0.ɵɵconditionalCreate(2, AppComponent_Conditional_2_Template, 1, 1)(3, AppComponent_Conditional_3_Template, 1, 0);
i0.ɵɵi18nEnd();
…
i0.ɵɵconditional(ctx.show ? 2 : 3);
…
