…
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵlistener("click", function MyComponent_click_HostBindingHandler($event) {
        return ctx.click($event.target);
    });
  }
}
