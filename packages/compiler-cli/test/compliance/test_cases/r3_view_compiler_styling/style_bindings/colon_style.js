// NOTE: This is the way TemplateDefinitionBuilder behaves today, but it's crazy!!
// NOTE: TODO: Should we fix it?
consts: [[__AttributeMarker.Styles__, ":root {color", "red"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵdomElement(0, "div", 0);
	}
}