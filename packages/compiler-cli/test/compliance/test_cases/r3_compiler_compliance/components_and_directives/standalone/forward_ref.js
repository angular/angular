TestComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: TestComponent,
  selectors: [
    ["test"]
  ],
  decls: 1,
  vars: 0,
  template: function TestComponent_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelement(0, "other-standalone");
    }
  },
  dependencies: () => [StandaloneComponent],
  encapsulation: 2
});
