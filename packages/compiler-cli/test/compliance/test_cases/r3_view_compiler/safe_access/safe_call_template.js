template: function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "span", 0);
    $i0$.ɵɵtext(1);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("title", "Your last name is " + (ctx.person.getLastName?.() ?? "unknown"));    
    $i0$.ɵɵadvance();
    $i0$.ɵɵtextInterpolate2(" Hello, ", ctx.person.getName?.() ?? null, "! You are a Balrog: ", (ctx.person.getSpecies?.()?.()?.()?.()?.() ?? null) || "unknown", " ");
  }
}
