$r3$.ɵɵdefineComponent({
  …
  decls: 6,
  vars: 0,
  consts: [[3, "click"]],
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomElementStart(0, "button", 0);
      $r3$.ɵɵdomListener("click", function TestComp_Template_button_click_0_listener() { return ctx.sigA.update(value => value + 1); });
      $r3$.ɵɵtext(1, "Increment A");
      $r3$.ɵɵdomElementEnd();
      $r3$.ɵɵdomElementStart(2, "button", 0);
      $r3$.ɵɵdomListener("click", function TestComp_Template_button_click_2_listener() { return ctx.sigA.update(value => value - 1); });
      $r3$.ɵɵtext(3, "Decrement A");
      $r3$.ɵɵdomElementEnd();
      $r3$.ɵɵdomElementStart(4, "button", 0);
      $r3$.ɵɵdomListener("click", function TestComp_Template_button_click_4_listener() { return ctx.sigB.update(value => value + 1); });
      $r3$.ɵɵtext(5, "Increment B");
      $r3$.ɵɵdomElementEnd();
    }
  },
  …
});
