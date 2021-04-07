hostBindings: function MyApp_HostBindings(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵlistener("click", function MyApp_click_HostBindingHandler() {
      let tmp_b_0 = null;
      let tmp_b_1 = null;
      return ctx.logLastName((tmp_b_0 = (tmp_b_1 = ctx.lastName) !== null && tmp_b_1 !== undefined ? tmp_b_1 : ctx.lastNameFallback) !== null && tmp_b_0 !== undefined ? tmp_b_0 : "unknown");
    });
  }
  if (rf & 2) {
    let tmp_b_0 = null;
    i0.ɵɵattribute("first-name", "Hello, " + ((tmp_b_0 = ctx.firstName) !== null && tmp_b_0 !== undefined ? tmp_b_0 : "Frodo") + "!");
  }
}
