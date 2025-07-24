MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 0, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div")(1, "p");
        i0.ɵɵanimateEnterListener(function MyComponent_Template_p_animateenter_1_listener($event) { return ctx.slideFn($event); });
        i0.ɵɵtext(2, "Sliding Content");
        i0.ɵɵdomElementEnd()();
    } }, encapsulation: 2 });
