MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: [[__AttributeMarker.Bindings__, "someDirective"]],
  template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
          $r3$.ɵɵelement(0, "div", 0);
      }
      if (rf & 2) {
          $r3$.ɵɵproperty("someDirective", true);
      }
  },
  …
  dependencies: [SomeDirective],
  encapsulation: 2
});
