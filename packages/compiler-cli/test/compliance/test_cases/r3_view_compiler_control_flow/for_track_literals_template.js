function $_forTrack0$($index, $item) {
  return this.trackFn({
    foo: $item,
    bar: $item
  }, [$item, $item]);
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 1, 1, null, null, $_forTrack0$, true);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater(ctx.items);
  }
}
