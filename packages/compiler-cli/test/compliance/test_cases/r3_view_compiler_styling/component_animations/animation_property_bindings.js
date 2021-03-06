// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  decls: 3,
  vars: 3,
  template:  function MyComponent_Template(rf, $ctx$) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "div");
      $r3$.ɵɵelement(1, "div");
      $r3$.ɵɵelement(2, "div");
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("@foo", ctx.exp);
      $r3$.ɵɵadvance(1);
      $r3$.ɵɵproperty("@bar", undefined);
      $r3$.ɵɵadvance(1);
      $r3$.ɵɵproperty("@baz", undefined);
    }
  },
  encapsulation: 2
});
