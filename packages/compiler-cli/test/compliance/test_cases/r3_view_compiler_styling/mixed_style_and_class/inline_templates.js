…
function StyleBindings_div_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div");
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵstyleProp("margin", $ctx_r0$.styleExp);
    $r3$.ɵɵclassProp("red", $ctx_r0$.classExp);
  }
}
…
function StyleMapBindings_div_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div");
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵstyleMap($ctx_r0$.styleExp);
    $r3$.ɵɵclassMap($ctx_r0$.classExp);
  }
}
…
consts: [
  [__AttributeMarker.Classes__, "foo", "bar", "baz",
    __AttributeMarker.Styles__, "margin", "0px", "background", "url('img.png')",
    __AttributeMarker.Template__, "ngIf"],
  [__AttributeMarker.Classes__, "foo", "bar", "baz",
    __AttributeMarker.Styles__, "margin", "0px", "background", "url('img.png')"]
],
template: function StaticStyling_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, StaticStyling_div_0_Template, 1, 0, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngIf", ctx.exp);
  }
}
…
consts: [
  [__AttributeMarker.Template__, "ngIf"]
],
template: function StyleBindings_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, StyleBindings_div_0_Template, 1, 4, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngIf", ctx.exp);
  }
}
…
consts: [
  [__AttributeMarker.Template__, "ngIf"]
],
template: function StyleMapBindings_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, StyleMapBindings_div_0_Template, 1, 4, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngIf", ctx.exp);
  }
}
…