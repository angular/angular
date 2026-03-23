function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const $s$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "div")(1, "div", 1);
    $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_1_listener() {
      $r3$.ɵɵrestoreView($s$);
      const $comp$ = $r3$.ɵɵnextContext();
      return $i0$.ɵɵresetView($comp$.onClick(1));
    });
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(2, "button", 1);
    $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_button_click_2_listener() {
      $r3$.ɵɵrestoreView($s$);
      const $comp2$ = $r3$.ɵɵnextContext();
      return $i0$.ɵɵresetView($comp2$.onClick2(2));
    });
    $r3$.ɵɵelementEnd()();
  }
}
// ...
consts: [[__AttributeMarker.Template__, "ngIf"], [__AttributeMarker.Bindings__, "click"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 0, "div", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("ngIf", ctx.showing);
  }
}
