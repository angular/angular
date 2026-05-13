function MyApp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "inner-cmp");
  }
}
…
template: function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0);
    $r3$.ɵɵdefer(1, 0, $MyApp_Defer_1_DepsFn$);
    $r3$.ɵɵdeferOnIdle();
  }
},
