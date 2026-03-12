function MyComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵtext(0, " some-content ");
  }
}

…

consts: [["attr", "l", __AttributeMarker.Bindings__, "boundAttr"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, "ng-template", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("boundAttr", ctx.b);
  }
}
