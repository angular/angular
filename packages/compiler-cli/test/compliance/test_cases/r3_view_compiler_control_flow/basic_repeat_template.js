function $repeatFn$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $colVar$ = ctx.$index;
    $r3$.ɵɵtextInterpolate1(" ", $colVar$, " ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, $repeatFn$, 1, 1, null, null, $r3$.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater($r3$.ɵɵrepeatCount(3));
  }
}
