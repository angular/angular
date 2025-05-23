consts: [[__AttributeMarker.Bindings__, "dir"]],
template: function TestComp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, $TestComp_ng_template_0_Template$, 0, 0, "ng-template", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("dir", $r3$.ɵɵinterpolate(ctx.message));
  }
}
