$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 1,
  consts: [[3, "click"]],
  template: function TestCmp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomElementStart(0, "button", 0);
      $r3$.ɵɵdomListener("click", function TestCmp_Template_button_click_0_listener() { return ctx.noop(); });
      $r3$.ɵɵdomElementEnd();
      $r3$.ɵɵtext(1);
    }
    if (rf & 2) {
      const $foo_r1$ = 123;
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" ", $foo_r1$, " ");
    }
  },
  …
});
