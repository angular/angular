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
