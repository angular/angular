function $MyApp_Conditional_3_Template$(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtext(0, " one ");
	}
  }

  function $MyApp_Conditional_5_Template$(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtext(0, " two ");
	}
  }

  function $MyApp_Conditional_6_Template$(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtext(0, " three ");
	}
  }
  …
  function MyApp_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelementStart(0, "div");
	  $r3$.ɵɵtext(1);
	  $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0);
	  $r3$.ɵɵpipe(3, "test");
	  $r3$.ɵɵpipe(4, "test");
	  $r3$.ɵɵconditionalBranchCreate(5, MyApp_Conditional_5_Template, 1, 0)(6, MyApp_Conditional_6_Template, 1, 0);
	  $r3$.ɵɵelementEnd();
	}
	if (rf & 2) {
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵconditional($r3$.ɵɵpipeBind1(3, 2, ctx.val) === 1 ? 2 : $r3$.ɵɵpipeBind1(4, 4, ctx.val) === 2 ? 5 : 6);
	}
  }
