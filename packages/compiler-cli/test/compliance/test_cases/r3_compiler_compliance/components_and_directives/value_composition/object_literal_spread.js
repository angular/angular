const $c0$ = a0 => ({ ...a0 });
const $c1$ = a0 => ({ a: 1, ...a0, b: 2 });
const $c2$ = (a0, a1, a2) => ({ ...a0, a: 1, ...a1, ...a2, b: 2 });
const $c3$ = { c: 3 };
const $c4$ = a0 => ({ b: a0 });
const $c5$ = a0 => ({ a: 1, ...a0 });

…

$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 18,
  template: function ObjectComp_Template(rf, ctx) {
    …
    if (rf & 2) {
      const simple_r1 = $r3$.ɵɵpureFunction1(4, $c0$, ctx.foo);
      const otherProps_r2 = $r3$.ɵɵpureFunction1(6, $c1$, ctx.foo);
      const multipleSpreads_r3 = $r3$.ɵɵpureFunction3(8, $c2$, ctx.foo, ctx.bar, ctx.baz);
      const objectLiteral_r4 = $r3$.ɵɵpureFunction1(16, $c5$, $r3$.ɵɵpureFunction1(14, $c4$, $r3$.ɵɵpureFunction1(12, $c0$, $c3$)));
      …
    }
  },
  …
});
