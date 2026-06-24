function MyApp_Defer_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "button");
  }
}

function MyApp_DeferLoading_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }

  if (rf & 2) {
    const $ctx$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate1(" ", $ctx$.loadingMessage, " ");
  }
}

function MyApp_DeferPlaceholder_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "img", 0);
  }
}

function MyApp_DeferError_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Calendar failed to load ");
    $r3$.ɵɵelementStart(1, "i");
    $r3$.ɵɵtext(2, "sad");
    $r3$.ɵɵelementEnd();
  }
}

…

MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵtext(1);
      $r3$.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0)(3, MyApp_DeferLoading_3_Template, 1, 1)(4, MyApp_DeferPlaceholder_4_Template, 1, 0)(5, MyApp_DeferError_5_Template, 3, 0);
      $r3$.ɵɵdefer(6, 2, null, 3, 4, 5);
      $r3$.ɵɵdeferOnIdle();
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    }
  },
  …
});

…

$r3$.ɵsetClassMetadata(MyApp, …);
