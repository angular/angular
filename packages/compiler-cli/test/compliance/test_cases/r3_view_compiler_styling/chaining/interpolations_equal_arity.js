// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  template: function MyComponent_Template(rf, $ctx$) {
    // ...
    if (rf & 2) {
      $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b")("border", "a", ctx.one, "b")("transition", "a", ctx.one, "b");
    }
  },
  encapsulation: 2
});
