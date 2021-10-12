consts: function () {
  __i18nMsg__('title {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  __i18nMsg__('label {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  __i18nMsg__('lang {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  return [
    [6, "title", "label", "lang"], ["title", $i18n_1$, "label", $i18n_2$, "lang", $i18n_3$]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 0);
    i0.ɵɵi18nAttributes(1, 1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵi18nExp(ctx.name)(ctx.name)(ctx.name);
    i0.ɵɵi18nApply(1);
  }
}
