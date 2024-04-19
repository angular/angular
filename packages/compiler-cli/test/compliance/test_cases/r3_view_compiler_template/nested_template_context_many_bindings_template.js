function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const $s$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "div", 1);
    $r3$.ɵɵlistener("click", function MyComponent_div_0_Template_div_click_0_listener() {
      const $sr$ = $r3$.ɵɵrestoreView($s$);
      const $d$ = $sr$.$implicit;
      const $i$ = $sr$.index;
      const $comp$ = $r3$.ɵɵnextContext();
      return $i0$.ɵɵresetView($comp$._handleClick($d$, $i$));
    });
    $r3$.ɵɵelementEnd();
  }
}
…
consts: [
  [__AttributeMarker.Bindings__, "click", __AttributeMarker.Template__, "ngFor", "ngForOf"],
  [__AttributeMarker.Bindings__, "click"]
],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngForOf", ctx._data);
  }
}
