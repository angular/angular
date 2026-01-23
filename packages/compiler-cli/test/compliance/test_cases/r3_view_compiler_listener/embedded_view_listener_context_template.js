function MyComponent_ng_template_0_Template(rf, $ctx$) {
	if (rf & 1) {
	  const $_r3$ = $i0$.ɵɵgetCurrentView();
	  $i0$.ɵɵelementStart(0, "button", 0);
	  $i0$.ɵɵlistener("click", function MyComponent_ng_template_0_Template_button_click_0_listener() {
		const $obj_r1$ = $i0$.ɵɵrestoreView($_r3$).$implicit;
		return $i0$.ɵɵresetView($obj_r1$.value = 1);
	  });
	  $i0$.ɵɵtext(1, "Change");
	  $i0$.ɵɵelementEnd();
	}
  }
  