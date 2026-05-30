template: function MyApp_Template(rf, $ctx$) {
	if (rf & 1) {
	  i0.ɵɵtext(0);
	}
	if (rf & 2) {
	  i0.ɵɵtextInterpolate4(" ", ctx.val?.foo.bar, " ", ctx.val?.[0].foo.bar, " ", ctx.foo(ctx.val)?.foo.bar, " ", ctx.val?.foo.bar, " ");
	}
  }
  