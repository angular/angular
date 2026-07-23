const $arrowFn0$ = (ctx, view) => (a, b) => a + b;
const $arrowFn1$ = (ctx, view) => (a, b) => a + b + ctx.componentProp;
…
$r3$.ɵɵdefineComponent({
  …
  decls: 5,
  vars: 8,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵpipe(1, "test");
      $r3$.ɵɵdomElement(2, "hr");
      $r3$.ɵɵtext(3);
      $r3$.ɵɵpipe(4, "test");
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵpipeBind1(1, 3, $r3$.ɵɵarrowFunction(2, $arrowFn0$, ctx)), " ");
      $r3$.ɵɵadvance(3);
      $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵpipeBind1(4, 6, $r3$.ɵɵarrowFunction(5, $arrowFn1$, ctx)), " ");
    }
  },
  …
});
