MyComponent.ɵcmp = /* @__PURE__ */i0.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["ng-component"]],
  decls: 1,
  vars: 1,
  consts: [[3, "control"]],
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelementStart(0, "input", 0);
      i0.ɵɵcontrolCreate();
      i0.ɵɵelementEnd();
    }
    if (rf & 2) {
      i0.ɵɵcontrol(ctx.value);
    }
  },
  dependencies: [Control],
  encapsulation: 2
});