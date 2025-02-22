function _forTrack0($index, $item) {
  return ($item == null
      ? null
      : $item.name == null
        ? null
        : $item.name[0] == null
          ? null
          : $item.name[0].toUpperCase()) ?? this.foo;
}

function _forTrack1($index, $item) {
  return $item.name ?? $index ?? this.foo;
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
