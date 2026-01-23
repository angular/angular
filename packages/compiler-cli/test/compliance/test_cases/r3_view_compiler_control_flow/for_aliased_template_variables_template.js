function MyApp_For_3_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtext(0);
	}
	if (rf & 2) {
		const $idx_r2$ = ctx.$index;
    const $co_r2$ = ctx.$count;
	  $r3$.ɵɵtextInterpolate6(" Index: ", $idx_r2$, " First: ", $idx_r2$ === 0, " Last: ", $idx_r2$ === $co_r2$ - 1, " Even: ", $idx_r2$ % 2 === 0, " Odd: ", $idx_r2$ % 2 !== 0, " Count: ", $co_r2$, " ");
	}
  }
  …
  function MyApp_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelementStart(0, "div");
	  $r3$.ɵɵtext(1);
	  $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 6, null, null, $r3$.ɵɵrepeaterTrackByIdentity);
	  $r3$.ɵɵelementEnd();
	}
	if (rf & 2) {
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵrepeater(ctx.items);
	}
  }
