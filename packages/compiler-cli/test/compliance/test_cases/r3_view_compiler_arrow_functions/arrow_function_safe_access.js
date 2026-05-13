const $arrowFn0$ = (ctx, view) => value =>value?.a?.b?.c?.()?.()?.()?.();
…
const arrowFn1 = (ctx, view) => () => ctx.componentProp?.a?.b?.c?.()?.()?.()?.();
…
$r3$.ɵɵdefineComponent({
  …
  decls: 3,
  vars: 4,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵdomElement(1, "hr");
      $r3$.ɵɵtext(2);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵarrowFunction(2, $arrowFn0$, ctx)(ctx.componentProp), " ");
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵarrowFunction(3, $arrowFn1$, ctx), " ");
    }
  },
  …
});
