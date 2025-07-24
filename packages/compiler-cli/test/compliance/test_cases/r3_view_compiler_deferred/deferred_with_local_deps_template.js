const $MyApp_Defer_4_DepsFn$ = () => [LazyDep];
…
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵelement(1, "eager-dep");
      $r3$.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0)(3, MyApp_DeferLoading_3_Template, 1, 0);
      $r3$.ɵɵdefer(4, 2, $MyApp_Defer_4_DepsFn$, 3);
      $r3$.ɵɵdeferOnIdle();
      $r3$.ɵɵelementEnd();
    }
  },
  dependencies: [EagerDep, LoadingDep],
  …
});

…
$r3$.ɵsetClassMetadata(MyApp, …);
