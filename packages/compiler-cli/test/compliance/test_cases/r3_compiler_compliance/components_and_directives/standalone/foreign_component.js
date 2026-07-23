function TestCmpChildren_Icon_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1, "Icon!");
    i0.ɵɵdomElementEnd();
  }
}

function TestCmpChildren_Description_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1, "Description text");
    i0.ɵɵdomElementEnd();
  }
}

function TestCmpChildren_Children_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1, "Other children");
    i0.ɵɵdomElementEnd();
  }
}

function TestCmpRenderProps_Items_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    const item_r1 = ctx[0];
    const index_r2 = ctx[1];
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("#", index_r2, ": ", item_r1);
  }
}

function TestCmpConditional_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵforeignComponent(0, 0, { label: ctx_r0.title });
  }
}

function TestCmpConditional_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TestCmpConditional_Conditional_0_Conditional_0_Template, 1, 0);
    (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵɵconditionalMetadata(0, "if", 1, null, "innerCondition", ["innerCondition"]);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.innerCondition ? 0 : -1);
  }
}

…

export class TestCmp {
  // ...
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["main"]],
    decls: 1,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵforeignComponent(0, 0, { class: "btn-cls", "unsafe-attr": "value", label: ctx.title, "unsafe-input": ctx.title });
      }
    },
    encapsulation: 2
  });
}

…

export class TestCmpChildren {
  // ...
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpChildren,
    selectors: [["main-children"]],
    decls: 4,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpChildren_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, TestCmpChildren_Icon_0_Template, 2, 0)(1, TestCmpChildren_Description_1_Template, 2, 0)(2, TestCmpChildren_Children_2_Template, 2, 0);
        i0.ɵɵforeignComponent(3, 0, { label: ctx.title, icon: i0.ɵɵforeignContent(0, 0), description: i0.ɵɵforeignContent(1, 0), children: i0.ɵɵforeignContent(2, 0) });
      }
    },
    encapsulation: 2
  });
}

…

export class TestCmpRenderProps {
  // ...
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpRenderProps,
    selectors: [["main-render-props"]],
    decls: 2,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpRenderProps_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, TestCmpRenderProps_Items_0_Template, 2, 2);
        i0.ɵɵforeignComponent(1, 0, { label: ctx.title, items: i0.ɵɵforeignContentFn(0, 0) });
      }
    },
    encapsulation: 2
  });
}

…

export class TestCmpConditional {
  // ...
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpConditional,
    selectors: [["main-conditional"]],
    decls: 1,
    vars: 1,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpConditional_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, TestCmpConditional_Conditional_0_Template, 1, 1);
        (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵɵconditionalMetadata(0, "if", 1, null, "outerCondition", ["outerCondition"]);
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.outerCondition ? 0 : -1);
      }
    },
    encapsulation: 2
  });
}

