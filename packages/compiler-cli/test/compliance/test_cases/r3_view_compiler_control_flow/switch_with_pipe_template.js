function MyApp_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵdomElementStart(0, "div");
	  $r3$.ɵɵtext(1);
	  $r3$.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 1, 0);
	  $r3$.ɵɵpipe(3, "test");
	  $r3$.ɵɵpipe(4, "test");
	  $r3$.ɵɵpipe(5, "test");
	  $r3$.ɵɵconditionalBranchCreate(6, MyApp_Case_6_Template, 1, 0)(7, MyApp_Case_7_Template, 1, 0);
	  (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(2, "switch", 3, 2, "value() | test", [["0 | test"], ["1 | test"], []]);
	  $r3$.ɵɵdomElementEnd();
	}
	if (rf & 2) {
	  let $MyApp_contFlowTmp$;
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵconditional(($MyApp_contFlowTmp$ = $r3$.ɵɵpipeBind1(3, 2, ctx.value())) === $r3$.ɵɵpipeBind1(4, 4, 0) ? 2 : $MyApp_contFlowTmp$ === $r3$.ɵɵpipeBind1(5, 6, 1) ? 6 : 7);
	}
  }
