MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], features: [i0.ɵɵAnimationsFeature()], decls: 3, vars: 0, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div")(1, "p");
        i0.ɵɵanimateLeaveListener(function MyComponent_Template_p_animateleave_1_listener($event) { return ctx.fadeFn($event); });
        i0.ɵɵtext(2, "Fading Content");
        i0.ɵɵdomElementEnd()();
    } }, encapsulation: 2 });
