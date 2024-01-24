const $SimpleComponent_Defer_5_DepsFn$ = () => [MyLazyCmp];

function SimpleComponent_Defer_1_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelement(0, "my-lazy-cmp");
	}
}

function SimpleComponent_DeferLoading_2_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtext(0, " Loading... ");
	}
}

function SimpleComponent_DeferPlaceholder_3_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtext(0, " Placeholder! ");
	}
}

function SimpleComponent_DeferError_4_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtext(0, " Failed to load dependencies :( ");
	}
}

…

decls: 1,
vars: 0,
template: function MyLazyCmp_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtext(0, "Hi!");
	}
}

…

decls: 7,
vars: 2,
template: function SimpleComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtext(0);
		i0.ɵɵtemplate(1, SimpleComponent_Defer_1_Template, 1, 0)(2, SimpleComponent_DeferLoading_2_Template, 1, 0)(3, SimpleComponent_DeferPlaceholder_3_Template, 1, 0)(4, SimpleComponent_DeferError_4_Template, 1, 0);
		i0.ɵɵdefer(5, 1, $SimpleComponent_Defer_5_DepsFn$, 2, 3, 4);
	} if (rf & 2) {
		i0.ɵɵtextInterpolate1(" Visible: ", ctx.isVisible, ". ");
		i0.ɵɵadvance(5);
		i0.ɵɵdeferWhen(ctx.isVisible);
	}
}