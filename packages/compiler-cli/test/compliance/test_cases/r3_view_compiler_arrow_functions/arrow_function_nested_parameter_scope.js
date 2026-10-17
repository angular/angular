const $arrowFn0$ = (ctx, view) => x => ctx.twice(y => y * 2) + ctx.y;
const $arrowFn1$ = (ctx, view) => x => ctx.twice(y => y) + ctx.twice(z => ctx.y);
…
$r3$.ɵɵdefineComponent({
  …
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate2(" ", $r3$.ɵɵarrowFunction(2, $arrowFn0$, ctx)(1), " ", $r3$.ɵɵarrowFunction(3, $arrowFn1$, ctx)(1), " ");
    }
  },
  …
});
