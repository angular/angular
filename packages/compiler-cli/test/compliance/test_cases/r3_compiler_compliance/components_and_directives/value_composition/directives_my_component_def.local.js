MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  standalone: false,
  decls: 2,
  vars: 0,
  consts: [["some-directive", ""]],
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "child", 0);
      $r3$.ɵɵtext(1, "!");
    }
  },
  dependencies: i0.ɵɵgetComponentDepsFactory(MyComponent),
  encapsulation: 2
});
