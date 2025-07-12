MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 0, consts: [[3, "animate.enter"]], template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div")(1, "p", 0);
        i0.ɵɵanimateEnterListener(function MyComponent_Template_p_enteranimate_enter_1_listener($event) { return ctx.slideFn($event); });
        i0.ɵɵtext(2, "Sliding Content");
        i0.ɵɵdomElementEnd()();
    } }, encapsulation: 2 });
