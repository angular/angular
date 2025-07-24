…
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵlistener("mousedown", function MyComponent_mousedown_HostBindingHandler() {
      return ctx.mousedown();
    })("click", function MyComponent_click_HostBindingHandler() {
      return ctx.click();
    });
  }
}
