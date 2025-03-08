if (rf & 2) {
  $r3$.ɵɵadvance();
  $r3$.ɵɵtextInterpolate1("No interpolations: ", ctx.tag `hello world `);
  $r3$.ɵɵadvance(2);
  $r3$.ɵɵtextInterpolate1("With interpolations: ", ctx.tag `hello ${ctx.name}, it is currently ${ctx.timeOfDay}!`);
  $r3$.ɵɵadvance(2);
  $r3$.ɵɵtextInterpolate1("With pipe: ", $r3$.ɵɵpipeBind1(6, 3, ctx.tag `hello ${ctx.name}`));
}
