function MyApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "p");
    $r3$.ɵɵtext(1, "Loaded!");
    $r3$.ɵɵdomElementEnd();
  }
}

function MyApp_DeferPlaceholder_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "p");
    $r3$.ɵɵtext(1, "Placeholder");
    $r3$.ɵɵdomElementEnd();
  }
}

function MyApp_DeferError_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "p");
    $r3$.ɵɵtext(1, "Failed!");
    $r3$.ɵɵdomElementEnd();
  }
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "div");
    $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 2, 0)(2, MyApp_DeferPlaceholder_2_Template, 2, 0)(3, MyApp_DeferError_3_Template, 2, 0);
    $r3$.ɵɵdefer(4, 1, null, null, 2, 3, null, null, null, null, $r3$.ɵɵdeferEnableRetry, 3);
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵdeferWhen(ctx.isVisible);
  }
}
