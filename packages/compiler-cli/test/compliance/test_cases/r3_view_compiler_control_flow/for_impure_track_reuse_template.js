function $_forTrack0$($index, $item) {
  /* @ts-ignore */
  return this.trackFn($item, this.message);
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 1, 1, null, null, $_forTrack0$, true);
    $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, $_forTrack0$, true);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater(ctx.items);
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵrepeater(ctx.otherItems);
  }
}
