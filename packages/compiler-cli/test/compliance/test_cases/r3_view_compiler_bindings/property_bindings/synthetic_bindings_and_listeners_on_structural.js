function MyComponent_button_0_Template(rf, ctx) {
	if (rf & 1) {
		const $_r1$ = i0.ɵɵgetCurrentView();
		i0.ɵɵelementStart(0, "button");
		i0.ɵɵlistener("@anim.start", function MyComponent_button_0_Template_button_animation_anim_start_0_listener($event) {
			i0.ɵɵrestoreView($_r1$);
			const $ctx_r1$ = i0.ɵɵnextContext();
			return i0.ɵɵresetView($ctx_r1$.fn($event));
		});
		i0.ɵɵelementEnd();
	} if (rf & 2) {
		const $ctx_r2$ = i0.ɵɵnextContext();
		i0.ɵɵproperty("@anim", $ctx_r2$.field);
	}
}

…

consts: [[__AttributeMarker.Template__, "ngIf"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵtemplate(0, MyComponent_button_0_Template, 1, 1, "button", 0);
	} if (rf & 2) {
		i0.ɵɵproperty("ngIf", true);
	}
}