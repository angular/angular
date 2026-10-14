import { Component } from "@angular/core";
import * as i0 from "@angular/core";
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
    i0.ɵɵforeignComponent(0, 0, () => ({ label: ctx_r0.title }));
  }
}
function TestCmpConditional_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TestCmpConditional_Conditional_0_Conditional_0_Template, 1, 0);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.innerCondition ? 0 : -1);
  }
}
export function FancyButton() {}
// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component) {
  return () => {};
}
export class TestCmp {
  title = "Submit";
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["main"]],
    decls: 1,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵforeignComponent(0, 0, () => ({
          class: "btn-cls",
          "unsafe-attr": "value",
          label: ctx.title,
          "unsafe-input": ctx.title
        }));
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "main",
              template: `
    <FancyButton class="btn-cls" unsafe-attr="value" [label]="title" [unsafe-input]="title" />
  `,
              // @ts-ignore: @angular/core does not expose the `foreignImports` property.
              foreignImports: [frameworkImport(FancyButton)]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: "TestCmp",
      filePath: "foreign_component.ts",
      lineNumber: 21
    });
})();
export class TestCmpChildren {
  title = "Submit";
  static ɵfac = function TestCmpChildren_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmpChildren)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpChildren,
    selectors: [["main-children"]],
    decls: 4,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpChildren_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, TestCmpChildren_Icon_0_Template, 2, 0)(
          1,
          TestCmpChildren_Description_1_Template,
          2,
          0
        )(2, TestCmpChildren_Children_2_Template, 2, 0);
        const icon_r1 = i0.ɵɵforeignContent(0, 0);
        const description_r2 = i0.ɵɵforeignContent(1, 0);
        const children_r3 = i0.ɵɵforeignContent(2, 0);
        i0.ɵɵforeignComponent(3, 0, () => ({
          label: ctx.title,
          icon: icon_r1,
          description: description_r2,
          children: children_r3
        }));
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmpChildren,
      [
        {
          type: Component,
          args: [
            {
              selector: "main-children",
              template: `
    <FancyButton [label]="title">
      @content (icon) {
        <span>Icon!</span>
      }
      @content (description) {
        <span>Description text</span>
      }
      <span>Other children</span>
    </FancyButton>
  `,
              // @ts-ignore: @angular/core does not expose the `foreignImports` property.
              foreignImports: [frameworkImport(FancyButton)]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmpChildren, {
      className: "TestCmpChildren",
      filePath: "foreign_component.ts",
      lineNumber: 44
    });
})();
export class TestCmpRenderProps {
  title = "Submit";
  static ɵfac = function TestCmpRenderProps_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmpRenderProps)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpRenderProps,
    selectors: [["main-render-props"]],
    decls: 2,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpRenderProps_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, TestCmpRenderProps_Items_0_Template, 2, 2);
        const items_r3 = i0.ɵɵforeignContentFn(0, 0);
        i0.ɵɵforeignComponent(1, 0, () => ({ label: ctx.title, items: items_r3 }));
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmpRenderProps,
      [
        {
          type: Component,
          args: [
            {
              selector: "main-render-props",
              template: `
    <FancyButton [label]="title">
      @content (items; let item, index) {
        <span>#{{index}}: {{item}}</span>
      }
    </FancyButton>
  `,
              // @ts-ignore: @angular/core does not expose the `foreignImports` property.
              foreignImports: [frameworkImport(FancyButton)]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmpRenderProps, {
      className: "TestCmpRenderProps",
      filePath: "foreign_component.ts",
      lineNumber: 63
    });
})();
// Nest @if to demonstrate that multiple `nextContext()` calls are correctly merged into one.
export class TestCmpConditional {
  title = "Submit";
  innerCondition = true;
  outerCondition = true;
  static ɵfac = function TestCmpConditional_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmpConditional)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpConditional,
    selectors: [["main-conditional"]],
    decls: 1,
    vars: 1,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpConditional_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, TestCmpConditional_Conditional_0_Template, 1, 1);
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.outerCondition ? 0 : -1);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmpConditional,
      [
        {
          type: Component,
          args: [
            {
              selector: "main-conditional",
              template: `
    @if (outerCondition) {
      @if (innerCondition) {
        <FancyButton [label]="title" />
      }
    }
  `,
              // @ts-ignore: @angular/core does not expose the `foreignImports` property.
              foreignImports: [frameworkImport(FancyButton)]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmpConditional, {
      className: "TestCmpConditional",
      filePath: "foreign_component.ts",
      lineNumber: 83
    });
})();
