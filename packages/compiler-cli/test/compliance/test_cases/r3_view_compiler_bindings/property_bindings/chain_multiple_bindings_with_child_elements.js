template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵproperty("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("id", 1)("title", "hello")("someProp", 1 + 2);
  }
}
