hostBindings: function MyDirective_HostBindings(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵlistener("mousedown", function MyDirective_mousedown_HostBindingHandler() { return ctx.mousedown(); })("mouseup", function MyDirective_mouseup_HostBindingHandler() { return ctx.mouseup(); })("click", function MyDirective_click_HostBindingHandler() { return ctx.click(); });
  }
}
