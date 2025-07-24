function MyApp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "button");
  }
}

function MyApp_DeferLoading_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "img", 1);
  }
}
…
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: [[2000, 500], ["src", "loading.gif"]],
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0)(1, MyApp_DeferLoading_1_Template, 1, 0);
      $r3$.ɵɵdefer(2, 0, null, 1, null, null, 0, null, $r3$.ɵɵdeferEnableTimerScheduling);
      $r3$.ɵɵdeferOnIdle();
    }
  },
  …
});

…
$r3$.ɵsetClassMetadata(MyApp, …);
