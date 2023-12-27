function MyApp_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtext(0);
	  $r3$.ɵɵtemplate(1, MyApp_Defer_1_Template, 1, 0);
	  $r3$.ɵɵdefer(2, 1);
	  $r3$.ɵɵpipe(4, "testPipe");
	}
	if (rf & 2) {
	  $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
	  $r3$.ɵɵadvance(2);
	  $r3$.ɵɵdeferWhen(ctx.isVisible() && $r3$.ɵɵpipeBind1(4, 2, ctx.isReady));
	}
  }
  