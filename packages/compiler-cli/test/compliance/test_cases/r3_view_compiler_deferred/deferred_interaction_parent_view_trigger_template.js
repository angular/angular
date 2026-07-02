function MyApp_ng_template_0_ng_template_4_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyApp_ng_template_0_ng_template_4_ng_template_0_Defer_0_Template, 0, 0);
    $r3$.ɵɵdefer(1, 0);
    $r3$.ɵɵdeferOnInteraction(1, 2);
    $r3$.ɵɵdeferPrefetchOnInteraction(1, 2);
  }
}
…
function MyApp_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵelementStart(1, "button", null, 0);
    $r3$.ɵɵtext(3, "Click me");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵtemplate(4, MyApp_ng_template_0_ng_template_4_Template, 1, 0, "ng-template");
  }
  if (rf & 2) {
    const ctx_r0 = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate1(" ", ctx_r0.message, " ");
  }
}
