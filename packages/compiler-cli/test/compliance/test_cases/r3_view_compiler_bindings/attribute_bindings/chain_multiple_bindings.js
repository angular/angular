template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
  }
}
