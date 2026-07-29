…
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵlistener("click", function MyComponent_click_HostBindingHandler($event) {
        return ctx.handleClick($event);
    })("beforeunload", function MyComponent_beforeunload_HostBindingHandler($event) {
        return ctx.handleBeforeUnload($event);
    }, i0.ɵɵresolveWindow);
  }
}
