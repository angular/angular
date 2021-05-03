MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: [[__AttributeMarker.Bindings__, "someDirective"]],
  template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
          $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
      }
      if (rf & 2) {
          $r3$.ɵɵproperty("someDirective", true);
      }
  },
  …
  directives: [SomeDirective],
  encapsulation: 2
});
