  …
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-comp"]], decls: 1, vars: 0, consts: [[3, "keydown"]], template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "button", 0);
            i0.ɵɵdomListener
            ("keydown", function MyComponent_Template_button_keydown_0_listener() { return ctx.handleEnter(); }, undefined, [i0.ɵɵkey("enter")])
            ("keydown", function MyComponent_Template_button_keydown_0_listener() { return ctx.handleShiftEnter(); }, undefined, [i0.ɵɵkey("shift.enter")])
            ("keydown", function MyComponent_Template_button_keydown_0_listener() { return ctx.handleArrowLeft(); }, undefined, [i0.ɵɵkey("arrowleft")]);
            i0.ɵɵdomElementEnd();
        } }, encapsulation: 2 });
  …