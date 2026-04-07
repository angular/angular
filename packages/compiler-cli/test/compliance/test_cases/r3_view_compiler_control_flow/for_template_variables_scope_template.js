function MyApp_For_2_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtext(0);
	}
	if (rf & 2) {
	  const $index_r2$ = ctx.$index;
	  const $index_2_r2$ = ctx.$index;
	  const $count_r3$ = ctx.$count;
	  const $count_2_r3$ = ctx.$count;
	  $r3$.ɵɵtextInterpolate4(" ", $index_r2$, " ", $count_r3$, " ", $index_2_r2$ === 0, " ", $index_2_r2$ === $count_2_r3$ - 1, " ");
	}
  }
  …
  function MyApp_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtext(0);
	  $r3$.ɵɵrepeaterCreate(1, MyApp_For_2_Template, 1, 4, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
	  $r3$.ɵɵtext(3);
	}
	if (rf & 2) {
	  $r3$.ɵɵtextInterpolate4(" ", ctx.$index, " ", ctx.$count, " ", ctx.$first, " ", ctx.$last, " ");
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵrepeater(ctx.items);
	  $r3$.ɵɵadvance(2);
	  $r3$.ɵɵtextInterpolate4(" ", ctx.$index, " ", ctx.$count, " ", ctx.$first, " ", ctx.$last, " ");
	}
  }
