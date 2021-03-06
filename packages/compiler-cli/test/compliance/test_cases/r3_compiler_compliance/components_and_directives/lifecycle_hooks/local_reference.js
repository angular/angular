// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  decls: 3,
  vars: 1,
  consts: [["user", ""]],
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "input", null, 0);
      $r3$.ɵɵtext(2);
    }
    if (rf & 2) {
      const $user$ = $r3$.ɵɵreference(1);
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1("Hello ", $user$.value, "!");
    }
  },
  encapsulation: 2
});
