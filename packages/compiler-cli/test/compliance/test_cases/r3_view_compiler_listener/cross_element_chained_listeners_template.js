…
consts: [[__AttributeMarker.Bindings__, "click", "change"], [__AttributeMarker.Bindings__, "update", "delete"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() { return ctx.click(); })("change", function MyComponent_Template_div_change_0_listener() { return ctx.change(); });
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(1, "some-comp", 1);
    $r3$.ɵɵlistener("update", function MyComponent_Template_some_comp_update_1_listener() { return ctx.update(); })("delete", function MyComponent_Template_some_comp_delete_1_listener() { return ctx.delete(); });
    $r3$.ɵɵelementEnd();
  }
}
