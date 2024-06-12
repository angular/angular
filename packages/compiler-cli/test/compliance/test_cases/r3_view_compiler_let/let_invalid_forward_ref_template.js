function MyApp_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdeclareLet(1);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", undefined, " ");
  }
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyApp_ng_template_0_Template, 2, 1, "ng-template");
  }
}
