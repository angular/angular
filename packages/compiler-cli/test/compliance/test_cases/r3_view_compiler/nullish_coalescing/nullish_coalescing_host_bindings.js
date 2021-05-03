hostBindings: function MyApp_HostBindings(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵlistener("click", function MyApp_click_HostBindingHandler() {
      let $tmp$;
      return ctx.logLastName(($tmp$ = ($tmp$ = ctx.lastName) !== null && $tmp$ !== undefined ? $tmp$ : ctx.lastNameFallback) !== null && $tmp$ !== undefined ? $tmp$ : "unknown");
    });
  }
  if (rf & 2) {
    let $tmp$;
    i0.ɵɵattribute("first-name", "Hello, " + (($tmp$ = ctx.firstName) !== null && $tmp$ !== undefined ? $tmp$ : "Frodo") + "!");
  }
}
