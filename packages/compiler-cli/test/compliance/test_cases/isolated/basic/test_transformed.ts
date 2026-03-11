…
static ɵfac: $r3$.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(__ngFactoryType__: any) {
  return new (__ngFactoryType__ || TestCmp)();
};

static ɵcmp: $r3$.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never> = /*@__PURE__*/
  $r3$.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    decls: 1,
    vars: 1,
    template: function TestCmp_Template(rf: number, ctx: any) {
    if (rf & 1) {
        $r3$.ɵɵtext(0);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate(ctx.x == null ? null : ctx.x.toString());
    }
  }, encapsulation: 2 });
…
