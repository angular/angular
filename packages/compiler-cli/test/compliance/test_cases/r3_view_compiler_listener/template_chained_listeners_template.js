…
consts: [[__AttributeMarker.Bindings__, "click", "change"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
    $r3$.ɵɵlistener("click", function MyComponent_Template_ng_template_click_0_listener() { return ctx.click(); })("change", function MyComponent_Template_ng_template_change_0_listener() { return ctx.change(); });
  }
}
