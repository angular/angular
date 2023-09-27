function $MyApp_Conditional_3_Template$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " one ");
  }
}

function $MyApp_Conditional_5_Template$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " two ");
  }
}

function $MyApp_Conditional_6_Template$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " three ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵpipe(2, "test");
    $r3$.ɵɵtemplate(3, $MyApp_Conditional_3_Template$, 1, 0);
    $r3$.ɵɵpipe(4, "test");
    $r3$.ɵɵtemplate(5, $MyApp_Conditional_5_Template$, 1, 0)(6, $MyApp_Conditional_6_Template$, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵconditional(3, $r3$.ɵɵpipeBind1(2, 2, ctx.val) === 1 ? 3 : $r3$.ɵɵpipeBind1(4, 4, ctx.val) === 2 ? 5 : 6);
  }
}
