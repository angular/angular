hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵsyntheticHostListener("@animation.done", function MyComponent_animation_animation_done_HostBindingHandler() { return ctx.done(); })("@animation.start", function MyComponent_animation_animation_start_HostBindingHandler() { return ctx.start(); });
    $r3$.ɵɵlistener("mousedown", function MyComponent_mousedown_HostBindingHandler() { return ctx.mousedown(); })("mouseup", function MyComponent_mouseup_HostBindingHandler() { return ctx.mouseup(); })("click", function MyComponent_click_HostBindingHandler() { return ctx.click(); });
  }
}
