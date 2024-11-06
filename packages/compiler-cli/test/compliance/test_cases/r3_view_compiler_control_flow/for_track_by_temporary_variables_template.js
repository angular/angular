function _forTrack0($index, $item) {
  let tmp_0_0;
  return (tmp_0_0 =
    $item == null
      ? null
      : $item.name == null
        ? null
        : $item.name[0] == null
          ? null
          : $item.name[0].toUpperCase()) !== null && tmp_0_0 !== undefined
    ? tmp_0_0
    : this.foo;
}

function _forTrack1($index, $item) {
  let tmp_0_0;
  return (tmp_0_0 = (tmp_0_0 = $item.name) !== null && tmp_0_0 !== undefined ? tmp_0_0 : $index) !==
    null && tmp_0_0 !== undefined
    ? tmp_0_0
    : this.foo;
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 0, 0, null, null, _forTrack0, true);
    $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 0, 0, null, null, _forTrack1, true);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater(ctx.items);
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵrepeater(ctx.items);
  }
}
