ChildComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChildComponent, selectors: [["child-component"]], hostBindings: function ChildComponent_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵanimateEnterListener(function ChildComponent_animateenter_HostBindingHandler($event) { return ctx.fadeFn($event); });
    } }, decls: 2, vars: 0, template: function ChildComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵdomElementStart(0, "p");
        i0.ɵɵtext(1, "Sliding Content");
        i0.ɵɵdomElementEnd();
    } }, encapsulation: 2 });
…
MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 0, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "child-component");
        i0.ɵɵanimateEnter("slide");
        i0.ɵɵelementEnd();
    } }, dependencies: [ChildComponent], encapsulation: 2 });
