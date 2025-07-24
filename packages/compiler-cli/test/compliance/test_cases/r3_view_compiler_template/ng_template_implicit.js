MyComponent_ng_template_0_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵtext(0);
	} if (rf & 2) {
		const $a_r1$ = ctx.$implicit;
		$r3$.ɵɵtextInterpolate($a_r1$);
	}
}
// ...
consts: [[3, "ngIf"]]
// ...
function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵdomTemplate(0, MyComponent_ng_template_0_Template, 1, 1, "ng-template", 0);
	} if (rf & 2) {
		$r3$.ɵɵdomProperty("ngIf", true);
	}
}
