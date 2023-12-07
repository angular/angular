MyComponent_div_0_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelement(0, "div");
	} if (rf & 2) {
		const $someElem_r1$ = ctx.$implicit;
		i0.ɵɵattribute("someInputAttr", $someElem_r1$.someAttr());
	}
}

…
consts: [[__AttributeMarker.Template__, "ngFor", "ngForOf"]],
template:function MyComponent_Template(rf, ctx){
	if (rf & 1) {
		i0.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 1, "div", 0);
	} if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx.someField.someMethod());
	}
}
