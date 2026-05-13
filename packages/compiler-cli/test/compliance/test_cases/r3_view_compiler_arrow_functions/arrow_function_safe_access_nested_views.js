const $arrowFn0$ = (ctx, view) => () => {
  $r3$.ɵɵrestoreView(view);
  const ctx_r0 = $r3$.ɵɵnextContext(3);
  return $r3$.ɵɵresetView(ctx_r0.componentProp?.a?.b?.c?.()?.()?.()?.() );
};

function TestComp_Conditional_0_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵarrowFunction(1, $arrowFn0$, ctx), " ");
  }
}

function TestComp_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, TestComp_Conditional_0_Conditional_0_Conditional_0_Template, 1, 2);
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
