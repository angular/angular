consts: [["id", "foo", __AttributeMarker.NamespaceURI__, "xlink", "href", "/foo", "name", "foo"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵnamespaceSVG();
		$r3$.ɵɵdomElement(0, "use")(1, "use", 0);
	} if (rf & 2) {
		$r3$.ɵɵattribute("href", ctx.value, null, "xlink");
	}
}
