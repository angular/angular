…
consts: () => {
  …
  return [
    [0, "title", i18n_1],
    [6, "title"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 1);
    i0.ɵɵi18nAttributes(1, 0);
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵi18nExp(ctx.b)(ctx.a);
    i0.ɵɵi18nApply(1);
  }
}
…
