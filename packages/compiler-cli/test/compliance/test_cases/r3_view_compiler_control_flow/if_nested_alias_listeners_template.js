function MyApp_Conditional_0_Conditional_1_Conditional_1_Template(rf, ctx) {
	if (rf & 1) {
	  const $_r7$ = $r3$.ɵɵgetCurrentView();
	  $r3$.ɵɵelementStart(0, "button", 0);
	  $r3$.ɵɵlistener("click", function MyApp_Conditional_0_Conditional_1_Conditional_1_Template_button_click_0_listener() {
		const $innermost_r5$ = $r3$.ɵɵrestoreView($_r7$);
		const $inner_r3$ = $r3$.ɵɵnextContext();
		const $root_r1$ = $r3$.ɵɵnextContext();
		const $ctx_r6$ = $r3$.ɵɵnextContext();
		return $r3$.ɵɵresetView($ctx_r6$.log($ctx_r6$.value(), $root_r1$, $inner_r3$, $innermost_r5$));
	  });
	  $r3$.ɵɵelementEnd();
	}
  }

  function MyApp_Conditional_0_Conditional_1_Template(rf, ctx) {
	if (rf & 1) {
	  const $_r11$ = $r3$.ɵɵgetCurrentView();
	  $r3$.ɵɵelementStart(0, "button", 0);
	  $r3$.ɵɵlistener("click", function MyApp_Conditional_0_Conditional_1_Template_button_click_0_listener() {
		const $inner_r3$ = $r3$.ɵɵrestoreView($_r11$);
		const $root_r1$ = $r3$.ɵɵnextContext();
		const $ctx_r10$ = $r3$.ɵɵnextContext();
		return $r3$.ɵɵresetView($ctx_r10$.log($ctx_r10$.value(), $root_r1$, $inner_r3$));
	  });
	  $r3$.ɵɵelementEnd();
	  $r3$.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Conditional_1_Template, 1, 0, "button");
	  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(1, "if", 1, null, "value()", ["value()"]);
	}
	if (rf & 2) {
	  let $MyApp_Conditional_0_Conditional_1_contFlowTmp$;
	  const $ctx_r2$ = $r3$.ɵɵnextContext(2);
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵconditional(($MyApp_Conditional_0_Conditional_1_contFlowTmp$ = $ctx_r2$.value()) ? 1 : -1, $MyApp_Conditional_0_Conditional_1_contFlowTmp$);
	}
  }

  function MyApp_Conditional_0_Template(rf, ctx) {
	if (rf & 1) {
	  const $_r14$ = $r3$.ɵɵgetCurrentView();
	  $r3$.ɵɵelementStart(0, "button", 0);
	  $r3$.ɵɵlistener("click", function MyApp_Conditional_0_Template_button_click_0_listener() {
		const $root_r1$ = $r3$.ɵɵrestoreView($_r14$);
		const $ctx_r13$ = $r3$.ɵɵnextContext();
		return $r3$.ɵɵresetView($ctx_r13$.log($ctx_r13$.value(), $root_r1$));
	  });
	  $r3$.ɵɵelementEnd();
	  $r3$.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Template, 2, 1);
	  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(1, "if", 1, null, "value()", ["value()"]);
	}
	if (rf & 2) {
	  let $MyApp_Conditional_0_contFlowTmp$;
	  const $ctx_r0$ = $r3$.ɵɵnextContext();
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵconditional(($MyApp_Conditional_0_contFlowTmp$ = $ctx_r0$.value()) ? 1 : -1, $MyApp_Conditional_0_contFlowTmp$);
	}
  }
  …
  function MyApp_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 1);
	  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(0, "if", 1, null, "value()", ["value()"]);
	}
	if (rf & 2) {
	  let $MyApp_contFlowTmp$;
	  $r3$.ɵɵconditional(($MyApp_contFlowTmp$ = ctx.value()) ? 0 : -1, $MyApp_contFlowTmp$);
	}
  }
