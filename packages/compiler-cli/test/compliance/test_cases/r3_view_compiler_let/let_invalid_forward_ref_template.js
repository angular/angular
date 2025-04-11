function MyApp_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate1(" ", undefined, " ");
    $ctx_r0$.value * 2;
  }
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyApp_ng_template_0_Template, 1, 1, "ng-template");
  }
}
