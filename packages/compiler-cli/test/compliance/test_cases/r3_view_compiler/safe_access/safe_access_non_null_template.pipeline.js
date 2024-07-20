template: function MyApp_Template(rf, $ctx$) {
	if (rf & 1) {
	  i0.ɵɵtext(0);
	}
	if (rf & 2) {
	  let $tmp_0_0$;
	  i0.ɵɵtextInterpolate4(" ", $ctx$.val == null ? null : $ctx$.val.foo.bar, " ", $ctx$.val == null ? null : $ctx$.val[0].foo.bar, " ", ($tmp_0_0$ = $ctx$.foo($ctx$.val)) == null ? null : $tmp_0_0$.foo.bar, " ", $ctx$.val == null ? null : $ctx$.val.foo.bar, " ");
	}
  }
  