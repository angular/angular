MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: [[__AttributeMarker.Bindings__, "someDirective"]],
  template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
          $r3$.ɵɵelementStart(0, "div", 0);
          $r3$.ɵɵlistener("someDirective", function MyComponent_Template_div_someDirective_0_listener() { return ctx.noop(); });
          $r3$.ɵɵelementEnd();
      }
  },
  …
  directives: [SomeDirective],
  encapsulation: 2
});
