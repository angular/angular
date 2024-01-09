function MyApp_For_3_For_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $subitem_r5$ = ctx.$implicit;
    const $item_r1$ = $r3$.ɵɵnextContext().$implicit;
    $r3$.ɵɵtextInterpolate2(" ", $subitem_r5$, " from ", $item_r1$.name, " ");
  }
}

function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵrepeaterCreate(1, MyApp_For_3_For_2_Template, 1, 2, null, null, $r3$.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    const $item_r1$ = ctx.$implicit;
    $r3$.ɵɵtextInterpolate1(" ", $item_r1$.name, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater($item_r1$.subItems);
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 3, 1, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater(ctx.items);
  }
}
