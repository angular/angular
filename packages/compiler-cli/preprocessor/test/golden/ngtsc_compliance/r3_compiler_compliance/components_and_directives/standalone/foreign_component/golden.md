# /out/foreign_component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestCmpChildren_Icon_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1, 'Icon!');
    i0.ɵɵelementEnd();
  }
}
function TestCmpChildren_Description_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1, 'Description text');
    i0.ɵɵelementEnd();
  }
}
function TestCmpChildren_Children_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1, 'Other children');
    i0.ɵɵelementEnd();
  }
}
function TestCmpRenderProps_Items_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1: any = ctx[0];
    const index_r2: any = ctx[1];
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2('#', index_r2, ': ', item_r1);
  }
}
function TestCmpConditional_Conditional_0_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const ctx_r0: any = i0.ɵɵnextContext(2);
    i0.ɵɵforeignComponent(0, 0, (): any => ({ label: ctx_r0.title }));
  }
}
function TestCmpConditional_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TestCmpConditional_Conditional_0_Conditional_0_Template, 1, 0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.innerCondition ? 0 : -1);
  }
}

export function FancyButton() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

export class TestCmp {
  title = 'Submit';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'main',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['main']],
    decls: 1,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵforeignComponent(0, 0, (): any => ({
          class: 'btn-cls',
          'unsafe-attr': 'value',
          label: ctx.title,
          'unsafe-input': ctx.title,
        }));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'main',
                template: `
        <FancyButton class="btn-cls" unsafe-attr="value" [label]="title" [unsafe-input]="title" />
      `,
                // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                foreignImports: [
                  // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                  frameworkImport(FancyButton),
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'foreign_component.ts',
      lineNumber: 21,
    });
})();

export class TestCmpChildren {
  title = 'Submit';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmpChildren, never> = function TestCmpChildren_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmpChildren)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmpChildren,
    'main-children',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpChildren,
    selectors: [['main-children']],
    decls: 4,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpChildren_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmpChildren_Icon_0_Template, 2, 0)(
          1,
          TestCmpChildren_Description_1_Template,
          2,
          0,
        )(2, TestCmpChildren_Children_2_Template, 2, 0);
        const icon_r1: any = i0.ɵɵforeignContent(0, 0);
        const description_r2: any = i0.ɵɵforeignContent(1, 0);
        const children_r3: any = i0.ɵɵforeignContent(2, 0);
        i0.ɵɵforeignComponent(3, 0, (): any => ({
          label: ctx.title,
          icon: icon_r1,
          description: description_r2,
          children: children_r3,
        }));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmpChildren,
        [
          {
            type: Component,
            args: [
              {
                selector: 'main-children',
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
                foreignImports: [
                  // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                  frameworkImport(FancyButton),
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmpChildren, {
      className: 'TestCmpChildren',
      filePath: 'foreign_component.ts',
      lineNumber: 44,
    });
})();

export class TestCmpRenderProps {
  title = 'Submit';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmpRenderProps, never> =
    function TestCmpRenderProps_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TestCmpRenderProps)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmpRenderProps,
    'main-render-props',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpRenderProps,
    selectors: [['main-render-props']],
    decls: 2,
    vars: 0,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpRenderProps_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmpRenderProps_Items_0_Template, 2, 2);
        const items_r3: any = i0.ɵɵforeignContentFn(0, 0);
        i0.ɵɵforeignComponent(1, 0, (): any => ({ label: ctx.title, items: items_r3 }));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmpRenderProps,
        [
          {
            type: Component,
            args: [
              {
                selector: 'main-render-props',
                template: `
        <FancyButton [label]="title">
          @content (items; let item, index) {
            <span>#{{index}}: {{item}}</span>
          }
        </FancyButton>
      `,
                // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                foreignImports: [
                  // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                  frameworkImport(FancyButton),
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmpRenderProps, {
      className: 'TestCmpRenderProps',
      filePath: 'foreign_component.ts',
      lineNumber: 63,
    });
})();

// Nest @if to demonstrate that multiple `nextContext()` calls are correctly merged into one.
export class TestCmpConditional {
  title = 'Submit';
  innerCondition = true;
  outerCondition = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmpConditional, never> =
    function TestCmpConditional_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TestCmpConditional)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmpConditional,
    'main-conditional',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmpConditional,
    selectors: [['main-conditional']],
    decls: 1,
    vars: 1,
    consts: [frameworkImport(FancyButton)],
    template: function TestCmpConditional_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, TestCmpConditional_Conditional_0_Template, 1, 1);
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.outerCondition ? 0 : -1);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmpConditional,
        [
          {
            type: Component,
            args: [
              {
                selector: 'main-conditional',
                template: `
        @if (outerCondition) {
          @if (innerCondition) {
            <FancyButton [label]="title" />
          }
        }
      `,
                // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                foreignImports: [
                  // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                  frameworkImport(FancyButton),
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmpConditional, {
      className: 'TestCmpConditional',
      filePath: 'foreign_component.ts',
      lineNumber: 83,
    });
})();

```