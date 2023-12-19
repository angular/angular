consts: [["id", "foo", __AttributeMarker.NamespaceURI__, "xlink", "href", "/foo", "name", "foo"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵnamespaceSVG();
		i0.ɵɵelement(0, "use")(1, "use", 0);
	} if (rf & 2) {
		i0.ɵɵattribute("href", ctx.value, null, "xlink");
	}
}
