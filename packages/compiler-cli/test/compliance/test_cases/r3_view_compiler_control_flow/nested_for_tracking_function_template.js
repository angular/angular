function _forTrack0($index, $item) {
  return this.trackByGrandparent($item, $index);
}

function _forTrack1($index, $item) {
  return this.trackByParent($item, $index);
}

function _forTrack2($index, $item) {
  return this.trackByChild($item, $index);
}

function MyApp_For_1_For_1_For_1_Template(rf, ctx) {}

function MyApp_For_1_For_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_For_1_For_1_Template, 0, 0, null, null, _forTrack2, true);
  }
  if (rf & 2) {
    const $parent_r7$ = ctx.$implicit;
    $r3$.ɵɵrepeater($parent_r7$.items);
  }
}

function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_For_1_Template, 2, 0, null, null, _forTrack1, true);
  }
  if (rf & 2) {
    const $grandparent_r1$ = ctx.$implicit;
    $r3$.ɵɵrepeater($grandparent_r1$.items);
  }
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 2, 0, null, null, _forTrack0, true);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater(ctx.items);
  }
}
