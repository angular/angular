…
consts: () => {
  …
  return [[0, "title", i18n_0], [3, "attr.title"]];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 1);
    i0.ɵɵattributeResolver("title", function MyComponent_Template_div_attr_title_0_listener($event) {
      return ctx.resolve($event);
    }, 1);
    i0.ɵɵi18nAttributes(1, 0);
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵi18nExp(ctx.name);
    i0.ɵɵi18nApply(1);
  }
}
…
