SimpleLayout.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: SimpleLayout,
  selectors: [["simple-layout"]],
  standalone: false,
  decls: 2,
  vars: 2,
  consts: [[__AttributeMarker.Bindings__, "name"]],
  template:  function SimpleLayout_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "lifecycle-comp", 0)(1, "lifecycle-comp", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("name", ctx.name1);
      $r3$.ɵɵadvance();
      $r3$.ɵɵproperty("name", ctx.name2);
    }
  },
  dependencies: [LifecycleComp],
  encapsulation: 2
});
