function TestComp_Conditional_0_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵtext(0);
    $r3$.ɵɵstoreCallback(1, () => {
      let $tmp_5_0$;
      $r3$.ɵɵrestoreView($_r1$);
      const $ctx_r1$ = $r3$.ɵɵnextContext(3);
      return $r3$.ɵɵresetView(
        $ctx_r1$.componentProp == null
          ? null
          : $ctx_r1$.componentProp.a == null
            ? null
            : $ctx_r1$.componentProp.a.b == null
              ? null
              : $ctx_r1$.componentProp.a.b.c == null
                ? null
                : ($tmp_5_0$ = $ctx_r1$.componentProp.a.b.c()) == null
                  ? null
                  : ($tmp_5_0$ = $tmp_5_0$()) == null
                    ? null
                    : ($tmp_5_0$ = $tmp_5_0$()) == null
                      ? null
                      : $tmp_5_0$());
    });
  }
  if (rf & 2) {
    const $_callbackFn0_r3$ = $r3$.ɵɵgetCallback(1);
    $r3$.ɵɵtextInterpolate1(" ", $_callbackFn0_r3$, " ");
  }
}

function TestComp_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, TestComp_Conditional_0_Conditional_0_Conditional_0_Template, 2, 1);
  }
  if (rf & 2) {
    $r3$.ɵɵconditional(true ? 0 : -1);
  }
}

function TestComp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, TestComp_Conditional_0_Conditional_0_Template, 1, 1);
  }
  if (rf & 2) {
    $r3$.ɵɵconditional(true ? 0 : -1);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 1,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵconditionalCreate(0, TestComp_Conditional_0_Template, 1, 1);
    }
    if (rf & 2) {
      $r3$.ɵɵconditional(true ? 0 : -1);
    }
  },
  …
});
