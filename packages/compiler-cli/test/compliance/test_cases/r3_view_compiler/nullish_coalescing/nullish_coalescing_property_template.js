template: function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 0)(1, "span", 0);
  }
  if (rf & 2) {
    let $tmp_0_0$;
    let $tmp_1_0$;
    $r3$.ɵɵproperty("title", "Hello, " + (($tmp_0_0$ = ctx.firstName) !== null && $tmp_0_0$ !== undefined ? $tmp_0_0$ : "Frodo") + "!");
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("title", "Your last name is " + (($tmp_1_0$ = ($tmp_1_0$ = ctx.lastName) !== null && $tmp_1_0$ !== undefined ? $tmp_1_0$ : ctx.lastNameFallback) !== null && $tmp_1_0$ !== undefined ? $tmp_1_0$ : "unknown"));
  }
}
