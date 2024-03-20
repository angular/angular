function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $item_r2$ = ctx.$implicit;
    $r3$.ɵɵtextInterpolate1(" ", $item_r2$.name, " ");
  }
}

function MyApp_ForEmpty_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " No items! ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, $r3$.ɵɵrepeaterTrackByIdentity, false, MyApp_ForEmpty_4_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater(ctx.items);
  }
}
