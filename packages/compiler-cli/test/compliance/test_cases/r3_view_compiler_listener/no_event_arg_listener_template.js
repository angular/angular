…
consts: [[__AttributeMarker.Bindings__, "click"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() {
      return ctx.onClick();
    });
    $r3$.ɵɵelementEnd();
  }
}
