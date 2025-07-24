function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵdomElementStart(0, "span");
		$r3$.ɵɵi18nStart(1, 0);
		$r3$.ɵɵdomElement(2, "input", 1);
		$r3$.ɵɵi18nEnd();
		$r3$.ɵɵdomElementEnd();
	} if (rf & 2) {
		$r3$.ɵɵadvance(2);
		$r3$.ɵɵdomProperty("disabled", ctx.someBoolean);
		$r3$.ɵɵi18nExp(ctx.someField);
		$r3$.ɵɵi18nApply(1);
	}
}