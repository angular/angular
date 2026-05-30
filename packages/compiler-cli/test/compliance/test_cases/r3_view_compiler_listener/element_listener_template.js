…
consts: [[__AttributeMarker.Bindings__, "click"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener($event) {
      ctx.onClick($event);
      return 1 == 1;
    });
    $r3$.ɵɵelementEnd();
  }
}
