const $c0$ = a0 => [...a0];
const $c1$ = a0 => [1, ...a0, 2];
const $c2$ = (a0, a1, a2) => [...a0, 1, ...a1, ...a2, 2];
const $c3$ = () => [3];
const $c4$ = a0 => [2, ...a0];
const $c5$ = a0 => [1, ...a0];

…

$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 17,
  template: function ArrayComp_Template(rf, ctx) {
    …
    if (rf & 2) {
      const simple_r1 = $r3$.ɵɵpureFunction1(4, $c0$, ctx.foo);
      const otherEntries_r2 = $r3$.ɵɵpureFunction1(6, $c1$, ctx.foo);
      const multipleSpreads_r3 = $r3$.ɵɵpureFunction3(8, $c2$, ctx.foo, ctx.bar, ctx.baz);
      const inlineArraySpread_r4 = $r3$.ɵɵpureFunction1(15, $c5$, $r3$.ɵɵpureFunction1(13, $c4$, $r3$.ɵɵpureFunction0(12, $c3$)));
      …
    }
  },
  …
});
