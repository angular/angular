function MyComponent_div_0_Template(rf, ctx) {
	if (rf & 1) {
		$i0$.ɵɵelement(0, "div");
	} if (rf & 2) {
		const $ctx_r0$ = $i0$.ɵɵnextContext();
		$i0$.ɵɵclassProp("bar", $ctx_r0$.field);
	}
}
…
consts: [[__AttributeMarker.Bindings__, "bar", __AttributeMarker.Template__, "ngIf"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$i0$.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 2, "div", 0);
	} if (rf & 2) {
		$i0$.ɵɵproperty("ngIf", true);
	}
}