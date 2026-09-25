const MyApp_Defer_4_DepsFn = () => [
  $r3$.ɵɵdeferDependency(() => /* @ts-ignore */
  import("./deferred_with_error_retry_dep"), m => m.RetryCmp)
];

function MyApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "retry-cmp");
  }
}

function MyApp_DeferPlaceholder_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "p");
    $r3$.ɵɵtext(1, "Placeholder");
    $r3$.ɵɵelementEnd();
  }
}

function MyApp_DeferError_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "p");
    $r3$.ɵɵtext(1, "Failed!");
    $r3$.ɵɵelementEnd();
  }
}

…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0)(2, MyApp_DeferPlaceholder_2_Template, 2, 0)(3, MyApp_DeferError_3_Template, 2, 0);
    $r3$.ɵɵdefer(4, 1, MyApp_Defer_4_DepsFn, null, 2, 3, null, null, null, null, 3, $r3$.ɵɵdeferEnableRetry);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵdeferWhen(ctx.isVisible);
  }
}
