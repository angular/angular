function TestCmp_ng_template_0_Template(rf: number, ctx: any) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate(ctx_r0.x);
  }
}
…
$r3$.ɵɵdefineComponent({
  type: TestCmp,
  selectors: [["test-cmp"]],
  decls: 1, vars: 0,
  template: function TestCmp_Template(rf: number, ctx: any) {
    if (rf & 1) {
      $r3$.ɵɵdomTemplate(0, TestCmp_ng_template_0_Template, 1, 1, "ng-template");
    }
  },
  encapsulation: 2
})
