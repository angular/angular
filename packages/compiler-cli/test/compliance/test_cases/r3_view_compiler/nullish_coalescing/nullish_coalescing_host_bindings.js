hostBindings: function MyApp_HostBindings(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵlistener("click", function MyApp_click_HostBindingHandler() {
      return ctx.logLastName(ctx.lastName ?? ctx.lastNameFallback ?? "unknown");
    });
  }
  if (rf & 2) {
    i0.ɵɵattribute("first-name", "Hello, " + (ctx.firstName ?? "Frodo") + "!");
  }
}
