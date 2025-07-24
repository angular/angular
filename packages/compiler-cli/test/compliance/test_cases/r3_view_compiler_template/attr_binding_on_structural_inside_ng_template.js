function MyComponent_ng_template_0_span_0_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelement(0, "span");
	} if (rf & 2) {
		const $ctx_r2$ = i0.ɵɵnextContext(2);
		i0.ɵɵattribute("someAttr", $ctx_r2$.someField);
	}
}

function MyComponent_ng_template_0_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtemplate(0, MyComponent_ng_template_0_span_0_Template, 1, 1, "span", 1);
	} if (rf & 2) {
		const $ctx_r0$ = i0.ɵɵnextContext();
		i0.ɵɵproperty("ngIf", $ctx_r0$.someBooleanField);
	}
}

…
consts: [["someLocalRef", ""], [4, "ngIf"]], template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 1, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
	}
}