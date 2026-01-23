function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵtext(0);
  }
  if (rf & 2) {
    $i0$.ɵɵtextInterpolateV([
      " ", ctx.list[0], " ", ctx.list[1], " ", ctx.list[2], " ", ctx.list[3], " ", ctx.list[4], " ",
      ctx.list[5], " ", ctx.list[6], " ", ctx.list[7], " ", ctx.list[8], " "
    ]);
  }
}