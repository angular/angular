const $_c0$ = [[["basic"]], "*", [["footer"]], [["structural"]]];
const $_c1$ = ["basic", "*", "footer", "structural"];

function TestComponent_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Basic fallback");
  }
}

function TestComponent_ProjectionFallback_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "h1");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵdomElementStart(2, "strong");
    $r3$.ɵɵtext(3, "content");
    $r3$.ɵɵdomElementEnd();
    $r3$.ɵɵtext(4, "!");
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1("This is ", $ctx_r0$.type, " ");
  }
}

function TestComponent_Conditional_5_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Inside control flow ");
  }
}

function TestComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵprojection(0, 2, null, TestComponent_Conditional_5_ProjectionFallback_0_Template, 1, 0);
  }
}

function TestComponent_ng_content_6_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "h2");
    $r3$.ɵɵtext(1, "With a structural directive");
    $r3$.ɵɵdomElementEnd();
  }
}

function TestComponent_ng_content_6_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵprojection(0, 3, ["*ngIf", "hasStructural"], TestComponent_ng_content_6_ProjectionFallback_0_Template, 2, 0);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  ngContentSelectors: $_c1$,
  decls: 7,
  vars: 2,
  consts: [[4, "ngIf"]],
  template: function TestComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵprojectionDef($_c0$);
      $r3$.ɵɵprojection(0, 0, null, TestComponent_ProjectionFallback_0_Template, 1, 0);
      $r3$.ɵɵdomElementStart(2, "div");
      $r3$.ɵɵprojection(3, 1, null, TestComponent_ProjectionFallback_3_Template, 5, 1);
      $r3$.ɵɵdomElementEnd();
      $r3$.ɵɵconditionalCreate(5, TestComponent_Conditional_5_Template, 2, 0);
      $r3$.ɵɵdomTemplate(6, TestComponent_ng_content_6_Template, 2, 0, "ng-content", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵadvance(5);
      $r3$.ɵɵconditional(ctx.hasFooter ? 5 : -1);
      $r3$.ɵɵadvance();
      $r3$.ɵɵdomProperty("ngIf", ctx.hasStructural);
    }
  },
  …
})
