function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const $_r2$ = i0.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "div", 2);
    $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_0_listener() {
      i0.ɵɵrestoreView($_r2$);
      const $ctx_r1$ = i0.ɵɵnextContext();
      return $i0$.ɵɵresetView($ctx_r1$.greet($ctx_r1$));
    });
    $r3$.ɵɵelementEnd();
  }
}
…
function MyComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 3);
  } if (rf & 2) {
    const $ctx_0$ = i0.ɵɵnextContext();
    $r3$.ɵɵproperty("id", $ctx_0$);
  }
}
