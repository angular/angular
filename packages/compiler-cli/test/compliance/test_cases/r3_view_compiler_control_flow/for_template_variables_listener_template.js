function MyApp_For_3_Template(rf, ctx) {
	if (rf & 1) {
	  const $_r5$ = $r3$.ɵɵgetCurrentView();
	  $r3$.ɵɵelementStart(0, "div", 0);
	  $r3$.ɵɵlistener("click", function MyApp_For_3_Template_div_click_0_listener() {
		const $restoredCtx$ = $r3$.ɵɵrestoreView($_r5$);
		const $index_r2$ = $restoredCtx$.$index;
		const $index_2_r2$ = $restoredCtx$.$index;
		const $count_r3$ = $restoredCtx$.$count;
		const $ctx_r4$ = $r3$.ɵɵnextContext();
		return $r3$.ɵɵresetView($ctx_r4$.log($index_r2$, $index_2_r2$ % 2 === 0, $index_2_r2$ === 0, $count_r3$));
	  });
	  $r3$.ɵɵelementEnd();
	}
  }
  …
  function MyApp_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelementStart(0, "div");
	  $r3$.ɵɵtext(1);
	  $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 0, "div", null, $r3$.ɵɵrepeaterTrackByIdentity);
	  $r3$.ɵɵelementEnd();
	}
	if (rf & 2) {
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵrepeater(ctx.items);
	}
  }
