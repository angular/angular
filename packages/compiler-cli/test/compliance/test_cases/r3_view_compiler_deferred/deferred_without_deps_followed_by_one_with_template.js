const MyApp_Defer_5_DepsFn = () => [LazyDep];
…
if (rf & 1) {
  $r3$.ɵɵelementStart(0, "div");
  $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0);
  $r3$.ɵɵdefer(2, 1);
  $r3$.ɵɵdeferOnIdle();
  $r3$.ɵɵdomTemplate(4, MyApp_Defer_4_Template, 1, 0);
  $r3$.ɵɵdefer(5, 4, MyApp_Defer_5_DepsFn);
  $r3$.ɵɵdeferOnIdle();
  $r3$.ɵɵelementEnd();
}