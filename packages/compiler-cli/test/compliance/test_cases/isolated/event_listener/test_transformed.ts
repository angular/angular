$r3$.ɵɵdefineComponent({
  type: TestCmp,
  selectors: [["test-cmp"]],
  decls: 1,
  vars: 0,
  consts: [[3, "click"]],
   template: function TestCmp_Template(rf: number, ctx: any) {
    if (rf & 1) {
      $r3$.ɵɵdomElementStart(0, "button", 0);
      $r3$.ɵɵdomListener("click", function TestCmp_Template_button_click_0_listener($event: any) { return ctx.handleClick($event); });
      $r3$.ɵɵdomElementEnd();
    }
  },
  encapsulation: 2
});
