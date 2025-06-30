ChildComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChildComponent, selectors: [["child-component"]], hostVars: 2, hostBindings: function ChildComponent_HostBindings(rf, ctx) { if (rf & 2) {
        i0.ɵɵanimateEnter("fade");
    } }, decls: 2, vars: 0, template: function ChildComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵdomElementStart(0, "p");
        i0.ɵɵtext(1, "Sliding Content");
        i0.ɵɵdomElementEnd();
    } }, encapsulation: 2 });
…
MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 2, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelement(0, "child-component");
    } if (rf & 2) {
        i0.ɵɵanimateEnter("slide");
    } }, dependencies: [ChildComponent], encapsulation: 2 });
