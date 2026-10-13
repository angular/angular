function MyApp_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", undefined, " ");
    $r3$.ɵɵnextContext().value * 2;
  }
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyApp_ng_template_0_Template, 1, 1, "ng-template");
  }
}
