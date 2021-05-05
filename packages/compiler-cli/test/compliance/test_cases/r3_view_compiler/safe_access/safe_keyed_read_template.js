template: function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 0);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $tmp_0_0$;
    i0.ɵɵproperty("title", "Your last name is " + ((ctx.unknownNames == null ? null : ctx.unknownNames[0]) || "unknown"));
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate4(" Hello, ", ctx.knownNames == null ? null : ctx.knownNames[0] == null ? null : ctx.knownNames[0][1], "! You are a Balrog: ", (ctx.species == null ? null : ctx.species[0] == null ? null : ctx.species[0][1] == null ? null : ctx.species[0][1][2] == null ? null : ctx.species[0][1][2][3] == null ? null : ctx.species[0][1][2][3][4] == null ? null : ctx.species[0][1][2][3][4][5]) || "unknown", " You are an Elf: ", ctx.speciesMap == null ? null : ctx.speciesMap[($tmp_0_0$ = ctx.keys == null ? null : ctx.keys[0]) !== null && $tmp_0_0$ !== undefined ? $tmp_0_0$ : "key"], " You are an Orc: ", ctx.speciesMap == null ? null : ctx.speciesMap["key"], " ");
  }
}
