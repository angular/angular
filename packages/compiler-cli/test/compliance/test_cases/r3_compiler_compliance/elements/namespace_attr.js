template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵnamespaceSVG();
		i0.ɵɵelement(0, "use");
		i0.ɵɵstaticHtml("<svg:use id=\"foo\" xlink:href=\"/foo\" name=\"foo\"/>");
	} if (rf & 2) {
		i0.ɵɵattribute("href", ctx.value, null, "xlink");
	}
}
