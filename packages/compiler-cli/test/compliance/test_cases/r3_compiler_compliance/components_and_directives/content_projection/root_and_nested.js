function Cmp_ng_template_1_ng_template_1_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵprojection(0, 3);
  }
}
function Cmp_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵprojection(0, 2);
    $r3$.ɵɵtemplate(1, Cmp_ng_template_1_ng_template_1_Template, 1, 0, "ng-template");
  }
}
function Cmp_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " '*' selector in a template: ");
    $r3$.ɵɵprojection(1, 4);
  }
}
const $_c0$ = [[["", "id", "tomainbefore"]], [["", "id", "tomainafter"]], [["", "id", "totemplate"]], [["", "id", "tonestedtemplate"]], "*"];
const $_c1$ = ["[id=toMainBefore]", "[id=toMainAfter]", "[id=toTemplate]", "[id=toNestedTemplate]", "*"];
// ...
template: function Cmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵprojectionDef($_c0$);
    $r3$.ɵɵprojection(0);
    $r3$.ɵɵtemplate(1, Cmp_ng_template_1_Template, 2, 0, "ng-template");
    $r3$.ɵɵtemplate(2, Cmp_ng_template_2_Template, 2, 0, "ng-template");
    $r3$.ɵɵprojection(3, 1);
  }
}
