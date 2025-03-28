hostBindings: function MyDirective_HostBindings(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵdomProperty("title", ctx.myTitle)("tabindex", 1)("id", ctx.myId);
  }
}
