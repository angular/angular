hostBindings: function MyDirective_HostBindings(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵhostProperty("tabindex", 1)("title", ctx.myTitle)("id", ctx.myId);
  }
}
