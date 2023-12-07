function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelementStart(0, "span");
		i0.ɵɵi18nStart(1, 0);
		i0.ɵɵelement(2, "input", 1);
		i0.ɵɵi18nEnd();
		i0.ɵɵelementEnd();
	} if (rf & 2) {
		i0.ɵɵadvance(2);
		i0.ɵɵproperty("disabled", ctx.someBoolean);
		i0.ɵɵi18nExp(ctx.someField);
		i0.ɵɵi18nApply(1);
	}
}