import * as i0 from "@angular/core";
function MyComponent_p_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵanimateEnter("slide");
    i0.ɵɵtext(1, "Sliding Content");
    i0.ɵɵelementEnd();
} }
…
MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 0, consts: [[4, "any-structural-directive"]], template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, MyComponent_p_1_Template, 2, 0, "p", 0);
    i0.ɵɵelementEnd();
} }, dependencies: [AnyStructuralDirective], encapsulation: 2 });
