const $_callbackFn0$ = value => {
  let $tmp_0_0$;
  return value == null
    ? null
    : value.a == null
      ? null
      : value.a.b == null
        ? null
        : value.a.b.c == null
          ? null
          : ($tmp_0_0$ = value.a.b.c()) == null
            ? null
            : ($tmp_0_0$ = $tmp_0_0$()) == null
              ? null
              : ($tmp_0_0$ = $tmp_0_0$()) == null
                ? null
                : $tmp_0_0$();
};
…
$r3$.ɵɵdefineComponent({
  …
  decls: 4,
  vars: 2,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵdomElement(1, "hr");
      $r3$.ɵɵtext(2);
      $r3$.ɵɵstoreCallback(3, () => {
        let $tmp_1_0$;
        return ctx.componentProp == null
          ? null
          : ctx.componentProp.a == null
            ? null
            : ctx.componentProp.a.b == null
              ? null
              : ctx.componentProp.a.b.c == null
                ? null
                : ($tmp_1_0$ = ctx.componentProp.a.b.c()) == null
                  ? null
                  : ($tmp_1_0$ = $tmp_1_0$()) == null
                    ? null
                    : ($tmp_1_0$ = $tmp_1_0$()) == null
                      ? null
                      : $tmp_1_0$();
      });
    }
    if (rf & 2) {
      const $_callbackFn1_r1$ = $r3$.ɵɵgetCallback(3);
      $r3$.ɵɵtextInterpolate1(" ", $_callbackFn0$(ctx.componentProp), " ");
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", $_callbackFn1_r1$, " ");
    }
  },
  …
});
