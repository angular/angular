if (rf & 2) {
  $r3$.ɵɵadvance();
  $r3$.ɵɵtextInterpolate1("No interpolations: ", $localize`hello world `, "");
  $r3$.ɵɵadvance(2);
  $r3$.ɵɵtextInterpolate1("With interpolations: ", $localize`hello ${ctx.name}, it is currently ${$localize`morning`}!`, "");
}
