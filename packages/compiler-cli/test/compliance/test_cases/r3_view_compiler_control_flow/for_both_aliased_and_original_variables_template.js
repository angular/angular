function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵelement(1, "hr");
    $r3$.ɵɵtext(2);
  }
  if (rf & 2) {
    const $index_r1$ = ctx.$index;
    const $index_4_r2$ = ctx.$index;
    const $count_r3$ = ctx.$count;
    const $count_4_r4$ = ctx.$count;
    $r3$.ɵɵtextInterpolate6(" Original index: ", $index_r1$, " Original first: ", $index_4_r2$ === 0, " Original last: ", $index_4_r2$ === $count_4_r4$ - 1, " Original even: ", $index_4_r2$ % 2 === 0, " Original odd: ", $index_4_r2$ % 2 !== 0, " Original count: ", $count_r3$, " ");
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵtextInterpolate6(" Aliased index: ", $index_4_r2$, " Aliased first: ", $index_4_r2$ === 0, " Aliased last: ", $index_4_r2$ === $count_4_r4$ - 1, " Aliased even: ", $index_4_r2$ % 2 === 0, " Aliased odd: ", $index_4_r2$ % 2 !== 0, " Aliased count: ", $count_4_r4$, " ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 3, 12, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵrepeater(ctx.items);
  }
}
