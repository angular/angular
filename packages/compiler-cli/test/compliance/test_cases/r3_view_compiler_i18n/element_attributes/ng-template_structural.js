function MyComponent_0_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Test");
  }
}
function MyComponent_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 1, 0, "ng-template", 1);
  }
}
…
consts: function() {
  __i18nMsg__('Hello', [], {})
  return [
    // NOTE: AttributeMarker.Template = 4
    [4, "ngIf"],
    ["title", $i18n_0$]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_0_Template, 1, 0, undefined, 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngIf", ctx.visible);
  }
}
