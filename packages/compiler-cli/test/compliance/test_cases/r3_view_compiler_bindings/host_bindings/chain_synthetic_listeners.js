hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵsyntheticHostListener("@animation.done", function MyComponent_animation_animation_done_HostBindingHandler() { return ctx.done(); })("@animation.start", function MyComponent_animation_animation_start_HostBindingHandler() { return ctx.start(); });
  }
}
