const $c0$ = () => [3];
const $c1$ = a0 => [2, ...a0];

…

$r3$.ɵɵdefineComponent({
  …
  decls: 7,
  vars: 7,
  template: function TestComp_Template(rf, ctx) {
    …
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate1(" ", ctx.fn(...ctx.foo), " ");
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", ctx.fn(1, ...ctx.foo, 2), " ");
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", ctx.fn(...ctx.foo, 1, ...ctx.bar, ...ctx.baz, 2), " ");
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", ctx.fn(1, ...$r3$.ɵɵpureFunction1(5, $c1$, $r3$.ɵɵpureFunction0(4, $c0$))), " ");
    }
  },
  …
});
