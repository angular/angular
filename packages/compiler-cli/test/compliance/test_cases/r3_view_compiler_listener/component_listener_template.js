…
consts: [[__AttributeMarker.Bindings__, "click"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "my-app", 0);
    $r3$.ɵɵlistener("click", function MyComponent_Template_my_app_click_0_listener($event) {
      return ctx.onClick($event);
    });
    $r3$.ɵɵelementEnd();
  }
}
