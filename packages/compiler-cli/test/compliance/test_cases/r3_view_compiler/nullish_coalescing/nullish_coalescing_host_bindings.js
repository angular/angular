hostBindings: function MyApp_HostBindings(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵlistener("click", function MyApp_click_HostBindingHandler() {
      let $tmp_0$;
      return ctx.logLastName(($tmp_0$ = ($tmp_0$ = ctx.lastName) !== null && $tmp_0$ !== undefined ? $tmp_0$ : ctx.lastNameFallback) !== null && $tmp_0$ !== undefined ? $tmp_0$ : "unknown");
    });
  }
  if (rf & 2) {
    let $tmp_1$;
    i0.ɵɵattribute("first-name", "Hello, " + (($tmp_1$ = ctx.firstName) !== null && $tmp_1$ !== undefined ? $tmp_1$ : "Frodo") + "!");
  }
}
