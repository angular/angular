// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  template: function MyComponent_Template(rf, $ctx$) {
    // ...
    if (rf & 2) {
      $r3$.ɵɵstyleProp("color", $r3$.ɵɵinterpolate1("a", ctx.one, "b"))("border", $r3$.ɵɵinterpolate1("a", ctx.one, "b"))("transition", $r3$.ɵɵinterpolate2("a", ctx.one, "b", ctx.two, "c"))("width", $r3$.ɵɵinterpolate3("a", ctx.one, "b", ctx.two, "c", ctx.three, "d"))("height", $r3$.ɵɵinterpolate1("a", ctx.one, "b"))("top", $r3$.ɵɵinterpolate1("a", ctx.one, "b"));
    }
  },
  encapsulation: 2
});
