template: function MyApp_Template(rf, $ctx$) {
	if (rf & 1) {
	  $i0$.ɵɵtext(0);
	  i0.ɵɵpipe(1, "identity");
	} if (rf & 2) {
	  i0.ɵɵtextInterpolate8(" ", 
		1 + 2, " ", 
		1 % 2 + 3 / 4 * 5 ** 6, " ", 
		+1, " ", 
		typeof i0.ɵɵpureFunction0(10, _c0) === "object", " ", 
		!(typeof i0.ɵɵpureFunction0(11, _c0) === "object"), " ", 
		typeof (ctx.foo == null ? null : ctx.foo.bar) === "string", " ", 
		i0.ɵɵpipeBind1(1, 8, typeof (ctx.foo == null ? null : ctx.foo.bar)), " ",
		void "test", " "
	  );	
	}
  }
  