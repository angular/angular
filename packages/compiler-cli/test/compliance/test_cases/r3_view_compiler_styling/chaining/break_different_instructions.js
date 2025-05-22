// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  template: function MyComponent_Template(rf, $ctx$) {
    // ...
    if (rf & 2) {
      $r3$.ɵɵstyleProp("color", $r3$.ɵɵinterpolate1("a", ctx.one, "b"))("border", $r3$.ɵɵinterpolate1("a", ctx.one, "b"))("transition", ctx.transition)("width", ctx.width)("height", $r3$.ɵɵinterpolate1("a", ctx.one, "b"))("top", $r3$.ɵɵinterpolate1("a", ctx.one, "b"));
      $r3$.ɵɵclassProp("apple", ctx.yesToApple)("orange", ctx.yesToOrange);
    }
  },
  encapsulation: 2
});
