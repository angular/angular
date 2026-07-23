function MyApp_For_3_For_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $count_r7$ = ctx.$count;
    const $outerCount_r3$ = $r3$.ɵɵnextContext().$count;
    $r3$.ɵɵtextInterpolate2(" Outer: ", $outerCount_r3$, " Inner: ", $count_r7$, " ");
  }
}

function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵrepeaterCreate(1, MyApp_For_3_For_2_Template, 1, 2, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
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
