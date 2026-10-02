const LinkedRetryApp_Defer_4_DepsFn = () => [
  $r3$.ɵɵdeferDependency(() => /* @ts-ignore */
  import("./deferred_with_error_retry_linked_dep"), m => m.LinkedRetryCmp)
];

function LinkedRetryApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "linked-retry-cmp");
  }
}

function LinkedRetryApp_DeferPlaceholder_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "p");
    $r3$.ɵɵtext(1, "Placeholder");
    $r3$.ɵɵelementEnd();
  }
}

function LinkedRetryApp_DeferError_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "p");
    $r3$.ɵɵtext(1, "Failed!");
    $r3$.ɵɵelementEnd();
  }
}

…
function LinkedRetryApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵdomTemplate(1, LinkedRetryApp_Defer_1_Template, 1, 0)(2, LinkedRetryApp_DeferPlaceholder_2_Template, 2, 0)(3, LinkedRetryApp_DeferError_3_Template, 2, 0);
    $r3$.ɵɵdefer(4, 1, LinkedRetryApp_Defer_4_DepsFn, null, 2, 3, null, null, null, null, 3, $r3$.ɵɵdeferEnableRetry);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵdeferWhen(ctx.isVisible);
  }
}
