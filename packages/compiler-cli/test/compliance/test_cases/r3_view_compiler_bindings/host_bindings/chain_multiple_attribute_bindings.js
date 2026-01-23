hostBindings: function MyDirective_HostBindings(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵattribute("title", ctx.myTitle)("tabindex", 1)("id", ctx.myId);
  }
}
