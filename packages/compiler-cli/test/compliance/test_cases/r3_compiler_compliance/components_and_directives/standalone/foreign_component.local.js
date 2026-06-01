function TestCmpChildren_Icon_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Icon!");
    i0.ɵɵelementEnd();
  }
}

function TestCmpChildren_Description_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Description text");
    i0.ɵɵelementEnd();
  }
}

function TestCmpChildren_Children_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Other children");
    i0.ɵɵelementEnd();
  }
}

function TestCmpRenderProps_Items_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1 = ctx[0];
    const index_r2 = ctx[1];
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("#", index_r2, ": ", item_r1);
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
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵforeignComponent(0, frameworkImport(FancyButton), { class: "btn-cls", "unsafe-attr": "value", label: ctx.title, "unsafe-input": ctx.title });
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
    template: function TestCmpChildren_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmpChildren_Icon_0_Template, 2, 0)(1, TestCmpChildren_Description_1_Template, 2, 0)(2, TestCmpChildren_Children_2_Template, 2, 0);
        i0.ɵɵforeignComponent(3, frameworkImport(FancyButton), { label: ctx.title, icon: i0.ɵɵforeignContent(0), description: i0.ɵɵforeignContent(1), children: i0.ɵɵforeignContent(2) });
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
    template: function TestCmpRenderProps_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmpRenderProps_Items_0_Template, 2, 2);
        i0.ɵɵforeignComponent(1, frameworkImport(FancyButton), { label: ctx.title, items: i0.ɵɵforeignContentFn(0) });
      }
    },
    encapsulation: 2
  });
}
