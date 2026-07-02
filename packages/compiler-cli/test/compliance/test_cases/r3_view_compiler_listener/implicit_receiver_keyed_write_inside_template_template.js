function MyComponent_ng_template_0_Template(rf, $ctx$) {
  if (rf & 1) {
    const $_r3$ = $i0$.ɵɵgetCurrentView();
    $i0$.ɵɵelementStart(0, "button", 1);
    $i0$.ɵɵlistener("click", function MyComponent_ng_template_0_Template_button_click_0_listener() {
      $i0$.ɵɵrestoreView($_r3$);
      const $ctx_2$ = $i0$.ɵɵnextContext();
      return $i0$.ɵɵresetView($ctx_2$["mes" + "sage"] = "hello");
    });
    $i0$.ɵɵtext(1, "Click me");
    $i0$.ɵɵelementEnd();
  }
}
