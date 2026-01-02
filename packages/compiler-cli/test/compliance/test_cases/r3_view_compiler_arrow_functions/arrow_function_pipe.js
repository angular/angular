const $_callbackFn0$ = (a, b) => a + b;
…
$r3$.ɵɵdefineComponent({
  …
  decls: 6,
  vars: 6,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵpipe(1, "test");
      $r3$.ɵɵdomElement(2, "hr");
      $r3$.ɵɵtext(3);
      $r3$.ɵɵpipe(4, "test");
      $r3$.ɵɵstoreCallback(5, (a, b) => a + b + ctx.componentProp);
    }
    if (rf & 2) {
      const $_callbackFn1_r1$ = $r3$.ɵɵgetCallback(5);
      $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵpipeBind1(1, 2, $_callbackFn0$), " ");
      $r3$.ɵɵadvance(3);
      $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵpipeBind1(4, 4, $_callbackFn1_r1$), " ");
    }
  },
  …
});
