// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  template: function MyComponent_Template(rf, $ctx$) {
    // ...
    if (rf & 2) {
      $r3$.ɵɵstylePropInterpolate1("color", "a", ctx.one, "b")("border", "a", ctx.one, "b");
      $r3$.ɵɵstyleProp("transition", ctx.transition)("width", ctx.width);
      $r3$.ɵɵstylePropInterpolate1("height", "a", ctx.one, "b")("top", "a", ctx.one, "b");
      $r3$.ɵɵclassProp("apple", ctx.yesToApple)("orange", ctx.yesToOrange);
    }
  },
  encapsulation: 2
});
