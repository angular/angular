function MyComponent_ng_template_0_Template(rf, ctx) { }

…

consts: [[__AttributeMarker.Bindings__, "outDirective"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
    $i0$.ɵɵlistener("outDirective", function MyComponent_Template_ng_template_outDirective_0_listener($event) { return $event.doSth(); });
  }
}
