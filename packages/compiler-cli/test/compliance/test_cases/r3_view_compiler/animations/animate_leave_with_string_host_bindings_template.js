ChildComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChildComponent, selectors: [["child-component"]], hostBindings: function ChildComponent_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵanimateLeave("fade");
    } }, features: [i0.ɵɵAnimationsFeature()],  decls: 2, vars: 0, template: function ChildComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵdomElementStart(0, "p");
        i0.ɵɵtext(1, "Fading Content");
        i0.ɵɵdomElementEnd();
    } }, encapsulation: 2 });
…
MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], features: [i0.ɵɵAnimationsFeature()], decls: 1, vars: 0, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "child-component");
        i0.ɵɵanimateLeave("slide");
        i0.ɵɵelementEnd();
    } }, dependencies: [ChildComponent], encapsulation: 2 });
