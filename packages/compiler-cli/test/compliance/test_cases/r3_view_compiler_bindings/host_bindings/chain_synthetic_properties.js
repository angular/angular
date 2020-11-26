hostBindings: function MyDirective_HostBindings(rf, ctx) {
  …
  if (rf & 2) {
    $r3$.ɵɵsyntheticHostProperty("@expand", ctx.expandedState)("@fadeOut", true)("@shrink", ctx.isSmall);
  }
}
