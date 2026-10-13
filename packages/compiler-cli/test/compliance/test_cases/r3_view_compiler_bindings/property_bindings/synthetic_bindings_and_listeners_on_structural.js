function MyComponent_button_0_Template(rf, ctx) {
	if (rf & 1) {
		const $_r1$ = $r3$.ɵɵgetCurrentView();
		$r3$.ɵɵdomElementStart(0, "button");
		$r3$.ɵɵlistener("@anim.start", function MyComponent_button_0_Template_button_animation_anim_start_0_listener($event) {
			$r3$.ɵɵrestoreView($_r1$);
			return $r3$.ɵɵresetView($r3$.ɵɵnextContext().fn($event));
		});
		$r3$.ɵɵdomElementEnd();
	} if (rf & 2) {
		$r3$.ɵɵproperty("@anim", $r3$.ɵɵnextContext().field);
	}
}

…

consts: [[__AttributeMarker.Template__, "ngIf"]],
template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵdomTemplate(0, MyComponent_button_0_Template, 1, 1, "button", 0);
	} if (rf & 2) {
		$r3$.ɵɵdomProperty("ngIf", true);
	}
}