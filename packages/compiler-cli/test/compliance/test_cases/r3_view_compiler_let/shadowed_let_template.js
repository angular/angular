function MyApp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵtext(1);
  }
  if (rf & 2) {
    const $value_r1$ = "local";
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" The value comes from ", $value_r1$, " ");
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 1,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵtemplate(1, MyApp_Conditional_1_Template, 2, 1);
    }
    if (rf & 2) {
      "parent";
      $r3$.ɵɵadvance();
      $r3$.ɵɵconditional(true ? 1 : -1);
    }
  },
  …
});
