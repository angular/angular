template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵattribute("id", 1)("title", "hello")("some-attr", 1 + 2);
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵattribute("some-attr", "one")("some-other-attr", 2);
  }
}
