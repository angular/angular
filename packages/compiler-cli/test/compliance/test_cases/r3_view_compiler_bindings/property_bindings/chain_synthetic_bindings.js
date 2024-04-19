template: function MyComponent_Template(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵproperty("title", ctx.myTitle)("@expand", ctx.expansionState)("tabindex", 1)("@fade", "out");
  }
}
