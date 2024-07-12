if (rf & 2) {
  $r3$.ɵɵadvance();
  $r3$.ɵɵtextInterpolate1("Four cubed is ", Math.pow(4, 3), "");
  $r3$.ɵɵadvance(2);
  $r3$.ɵɵtextInterpolate2("", Math.pow((Math.pow(ctx.two, ctx.three)), 2), " is smaller than ", Math.pow((Math.pow(3, 3)), 2), "");
  $r3$.ɵɵadvance(2);
  $r3$.ɵɵtextInterpolate1("My favorite number is ", (Math.pow((Math.pow(2, 3)), ctx.two) + 7 - 3 * 6) / 16, "");
}
