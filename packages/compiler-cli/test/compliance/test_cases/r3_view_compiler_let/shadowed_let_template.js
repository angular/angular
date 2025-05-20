function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $value_r1$ = "local";
    $r3$.ɵɵtextInterpolate1(" The value comes from ", $value_r1$, " ");
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 1,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 1);
    }
    if (rf & 2) {
      "parent";
      $r3$.ɵɵconditional(true ? 0 : -1);
    }
  },
  …
});
