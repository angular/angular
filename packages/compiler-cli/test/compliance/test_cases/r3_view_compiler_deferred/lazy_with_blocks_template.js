const $SimpleComponent_Defer_5_DepsFn$ = () => [MyLazyCmp];

function SimpleComponent_Defer_1_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵelement(0, "my-lazy-cmp");
	}
}

function SimpleComponent_DeferLoading_2_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵtext(0, " Loading... ");
	}
}

function SimpleComponent_DeferPlaceholder_3_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵtext(0, " Placeholder! ");
	}
}

function SimpleComponent_DeferError_4_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵtext(0, " Failed to load dependencies :( ");
	}
}

…

decls: 1,
vars: 1,
template: function MyLazyCmp_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵtext(0);
	} if (rf & 2) {
		$r3$.ɵɵtextInterpolate(ctx.hi);
	}

}

…

decls: 7,
vars: 2,
template: function SimpleComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵtext(0);
		$r3$.ɵɵtemplate(1, SimpleComponent_Defer_1_Template, 1, 0)(2, SimpleComponent_DeferLoading_2_Template, 1, 0)(3, SimpleComponent_DeferPlaceholder_3_Template, 1, 0)(4, SimpleComponent_DeferError_4_Template, 1, 0);
		$r3$.ɵɵdefer(5, 1, $SimpleComponent_Defer_5_DepsFn$, 2, 3, 4);
	} if (rf & 2) {
		$r3$.ɵɵtextInterpolate1(" Visible: ", ctx.isVisible, ". ");
		$r3$.ɵɵadvance(5);
		$r3$.ɵɵdeferWhen(ctx.isVisible);
	}
}

…

$r3$.ɵsetClassMetadata(SimpleComponent, …);
