template: function MyApp_Template(rf, $ctx$) {
	if (rf & 1) {
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_2_listener() { return $ctx$.number += 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_3_listener() { return $ctx$.number -= 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_4_listener() { return $ctx$.number *= 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_5_listener() { return $ctx$.number /= 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_6_listener() { return $ctx$.number %= 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_7_listener() { return $ctx$.number **= 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_8_listener() { return $ctx$.number &&= 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_9_listener() { return $ctx$.number ||= 1; });
		…
		$r3$.ɵɵlistener("click", function MyApp_Template_button_click_10_listener() { return $ctx$.number ??= 1; });
		…
	} 
	if (rf & 2) {
	  $r3$.ɵɵtextInterpolateV([" ", 
		1 + 2, " ", 
		1 % 2 + 3 / 4 * 5 ** 6, " ", 
		+1, " ", 
		typeof $r3$.ɵɵpureFunction0(12, _c0) === "object", " ", 
		!(typeof $r3$.ɵɵpureFunction0(13, _c0) === "object"), " ", 
		typeof ($ctx$.foo == null ? null : $ctx$.foo.bar) === "string", " ", 
		$r3$.ɵɵpipeBind1(1, 10, typeof ($ctx$.foo == null ? null : $ctx$.foo.bar)), " ",
		void "test", " ",
		(-1) ** 3, " ",
		"bar" in $ctx$.foo, " "
	  ]);	
	}
}
  