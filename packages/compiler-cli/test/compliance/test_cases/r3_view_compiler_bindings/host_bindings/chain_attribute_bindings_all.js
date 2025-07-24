hostBindings: function MyDirective_HostBindings(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵattribute("tabindex", 1)("title", ctx.myTitle)("id", ctx.myId);
  }
}
