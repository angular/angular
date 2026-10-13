function MyComponent_div_0_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵdomElement(0, "div");
	} if (rf & 2) {
		$r3$.ɵɵclassProp("bar", $r3$.ɵɵnextContext().field);
	}
}
…
consts: [[__AttributeMarker.Bindings__, "bar", __AttributeMarker.Template__, "ngIf"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵdomTemplate(0, MyComponent_div_0_Template, 1, 2, "div", 0);
	} if (rf & 2) {
		$r3$.ɵɵdomProperty("ngIf", true);
	}
}