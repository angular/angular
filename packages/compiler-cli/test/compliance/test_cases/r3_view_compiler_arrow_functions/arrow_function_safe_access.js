const $arrowFn0$ = (ctx, view) => value => {
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
const $arrowFn1$ = (ctx, view) => () => {
  let $tmp_0_0$;
  return ctx.componentProp == null
    ? null
    : ctx.componentProp.a == null
      ? null
      : ctx.componentProp.a.b == null
        ? null
        : ctx.componentProp.a.b.c == null
          ? null
          : ($tmp_0_0$ = ctx.componentProp.a.b.c()) == null
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
