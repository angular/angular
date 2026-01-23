template: function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 0)(1, "span", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("title", "Hello, " + (ctx.firstName ?? "Frodo") + "!");
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("title", "Your last name is " + (ctx.lastName ?? ctx.lastNameFallback ?? "unknown"));
  }
}
