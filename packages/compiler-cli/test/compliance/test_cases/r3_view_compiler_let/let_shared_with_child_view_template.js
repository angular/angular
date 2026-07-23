function MyApp_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $value_0$ = $r3$.ɵɵreadContextLet(0);
    $r3$.ɵɵtextInterpolate($value_0$);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 3,
  vars: 2,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵtext(1);
      $r3$.ɵɵdomTemplate(2, MyApp_ng_template_2_Template, 1, 1, "ng-template");
    }
    if (rf & 2) {
      const $value_r0$ = $r3$.ɵɵstoreLet(123);
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" ", $value_r0$, " ");
    }
  },
  …
});
