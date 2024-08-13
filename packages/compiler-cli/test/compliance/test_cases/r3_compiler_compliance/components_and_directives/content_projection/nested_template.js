function Cmp_div_0_Template(rf, ctx) { if (rf & 1) {
  $r3$.ɵɵelementStart(0, "div", 2);
  $r3$.ɵɵprojection(1);
  $r3$.ɵɵelementEnd();
} }
function Cmp_div_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 3);
    $r3$.ɵɵtext(1, " No ng-content, no instructions generated. ");
    $r3$.ɵɵelementEnd();
  }
}
function Cmp_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " '*' selector: ");
    $r3$.ɵɵprojection(1, 1);
  }
}
// ...
consts: [["id", "second", __AttributeMarker.Template__, "ngIf"], ["id", "third", __AttributeMarker.Template__, "ngIf"], ["id", "second"], ["id", "third"]],
template: function Cmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵprojectionDef($_c4$);
    $r3$.ɵɵtemplate(0, Cmp_div_0_Template, 2, 0, "div", 0)(1, Cmp_div_1_Template, 2, 0, "div", 1)(2, Cmp_ng_template_2_Template, 2, 0, "ng-template");
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngIf", ctx.visible);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("ngIf", ctx.visible);
  }
}
