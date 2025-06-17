function MyComponent_ng_template_0_Template(rf, ctx) { }

…
// NOTE: Template Pipeline also collects the "a" into the Bindings section; this should be fine.
consts: [["l", "l1", __AttributeMarker.Bindings__, "p" … "c"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵdomTemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
	} if (rf & 2) {
		i0.ɵɵdomProperty("p", ctx.p1)("a", ctx.a1)("c", ctx.c1);
	}
}