function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $index_r2$ = ctx.$index;
    $r3$.ɵɵtextInterpolate1(" ", ($index_r2$ % 2 !== 0) + "", " ");
  }
}
