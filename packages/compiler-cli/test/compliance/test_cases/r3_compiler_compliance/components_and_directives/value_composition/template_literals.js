if (rf & 2) {
  $r3$.ɵɵadvance();
  $r3$.ɵɵtextInterpolate1("No interpolations: ", `hello world `);
  $r3$.ɵɵadvance(2);
  $r3$.ɵɵtextInterpolate1("With interpolations: ", `hello ${ctx.name}, it is currently ${ctx.timeOfDay}!`);
  $r3$.ɵɵadvance(2);
  $r3$.ɵɵtextInterpolate1("With pipe: ", $r3$.ɵɵpipeBind1(6, 4, `hello ${ctx.name}`));
  const $insideLet_r1$ = `Hello ${ctx.name}`;
  $r3$.ɵɵadvance(3);
  $r3$.ɵɵtextInterpolate1(" Inside let: ", $insideLet_r1$);
}
