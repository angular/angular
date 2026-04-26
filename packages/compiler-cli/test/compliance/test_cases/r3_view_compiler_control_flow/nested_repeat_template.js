function $innerRepeatFn$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $rowVar$ = $r3$.ɵɵnextContext().$index;
    const $colVar$ = ctx.$index;
    $r3$.ɵɵtextInterpolate2(" ", $rowVar$, ":", $colVar$, " ");
  }
}
…
function $outerRepeatFn$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, $innerRepeatFn$, 1, 2, null, null, $r3$.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater($r3$.ɵɵrepeatCount(ctx.cols));
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, $outerRepeatFn$, …, null, null, $r3$.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater($r3$.ɵɵrepeatCount(ctx.rows));
  }
}
