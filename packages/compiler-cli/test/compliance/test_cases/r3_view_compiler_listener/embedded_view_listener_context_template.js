function MyComponent_ng_template_0_Template(rf, $ctx$) {
  if (rf & 1) {
    const _r3 = $i0$.ɵɵgetCurrentView();
    $i0$.ɵɵelementStart(0, "button", 0);
    $i0$.ɵɵlistener("click", function MyComponent_ng_template_0_Template_button_click_0_listener() {
      const restoredCtx = $i0$.ɵɵrestoreView(_r3);
      const $obj_r1$ = restoredCtx.$implicit;
      return $obj_r1$.value = 1;
    });
    $i0$.ɵɵtext(1, "Change");
    $i0$.ɵɵelementEnd();
  }
}
