MyComponent.ɵcmp = /* @__PURE__ */i0.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["ng-component"]],
  decls: 4,
  vars: 3,
  consts: [["field", "Not a form control"], [3, "field"]],
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelement(0, "div", 0);
      i0.ɵɵelementStart(1, "div");
      i0.ɵɵtext(2, "Not a form control either.");
      i0.ɵɵelementEnd();
      i0.ɵɵelement(3, "input", 1);
      i0.ɵɵcontrolCreate();
    }
    if (rf & 2) {
      i0.ɵɵadvance();
      i0.ɵɵattribute("field", ctx.value);
      i0.ɵɵadvance(2);
      i0.ɵɵcontrol(ctx.value);
    }
  },
  dependencies: [Field],
  encapsulation: 2
});