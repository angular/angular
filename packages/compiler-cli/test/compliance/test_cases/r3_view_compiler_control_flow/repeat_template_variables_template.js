function $repeatFn$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $idxVar$ = ctx.$index;
    const $cntVar$ = ctx.$count;
    $r3$.ɵɵtextInterpolate6(" ", $idxVar$, "/", $cntVar$, "/", $idxVar$ === 0, "/", $idxVar$ === $cntVar$ - 1, "/", $idxVar$ % 2 === 0, "/", $idxVar$ % 2 !== 0, " ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, $repeatFn$, 1, 6, null, null, $r3$.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater($r3$.ɵɵrepeatCount(ctx.columns));
  }
}
