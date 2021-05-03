// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  template: function MyComponent_Template(rf, $ctx$) {
    // ...
    if (rf & 2) {
      $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b")("border", "a", ctx.one, "b");
      $r3$.ɵɵstylePropInterpolate2("transition", "a", ctx.one, "b", ctx.two, "c");
      $r3$.ɵɵstylePropInterpolate3("width", "a", ctx.one, "b", ctx.two, "c", ctx.three, "d");
      $r3$.ɵɵstylePropInterpolate1("height", "a", ctx.one, "b")("top", "a", ctx.one, "b");
    }
  },
  encapsulation: 2
});
