MyComponent_ng_template_0_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtext(0);
	} if (rf & 2) {
		const $a_r1$ = i0.ɵɵnextContext();
		i0.ɵɵtextInterpolate($a_r1$);
	}
}
// ...
consts: [[3, "ngIf"]]
// ...
function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 1, "ng-template", 0);
	} if (rf & 2) {
		i0.ɵɵproperty("ngIf", true);
	}
}