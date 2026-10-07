# /out/external.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ExternalCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExternalCmp, never> = function ExternalCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ExternalCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ExternalCmp,
    'external-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ExternalCmp,
    selectors: [['external-cmp']],
    decls: 3,
    vars: 0,
    template: function ExternalCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div')(1, 'span');
        i0.ɵɵtext(2, 'external');
        i0.ɵɵelementEnd()();
        i0.ɵɵattachSourceLocations('external.component.html', [
          [0, 0, 0, 0],
          [1, 8, 1, 2],
        ]);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExternalCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'external-cmp',
                template: '<div>\n  <span>external</span>\n</div>',
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
    i0.ɵsetClassDebugInfo(ExternalCmp, {
      className: 'ExternalCmp',
      filePath: 'external.component.ts',
      lineNumber: 7,
    });
})();

```

# /out/inline.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function InlineCmp_Conditional_7_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'button');
    i0.ɵɵtext(1, 'Go');
    i0.ɵɵelementEnd();
    i0.ɵɵattachSourceLocations('inline.component.ts', [[0, 206, 10, 6]]);
  }
}

export class InlineCmp {
  show = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InlineCmp, never> = function InlineCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InlineCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    InlineCmp,
    'inline-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: InlineCmp,
    selectors: [['inline-cmp']],
    decls: 8,
    vars: 1,
    template: function InlineCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'section')(1, 'h1');
        i0.ɵɵtext(2, 'Title');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, 'p');
        i0.ɵɵtext(4, 'Body ');
        i0.ɵɵelementStart(5, 'span');
        i0.ɵɵtext(6, 'text');
        i0.ɵɵelementEnd()()();
        i0.ɵɵconditionalCreate(7, InlineCmp_Conditional_7_Template, 2, 0, 'button');
        i0.ɵɵattachSourceLocations('inline.component.ts', [
          [0, 101, 5, 4],
          [1, 117, 6, 6],
          [3, 138, 7, 6],
          [5, 146, 7, 14],
        ]);
      }
      if (rf & 2) {
        i0.ɵɵadvance(7);
        i0.ɵɵconditional(ctx.show ? 7 : -1);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InlineCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'inline-cmp',
                template: `
        <section>
          <h1>Title</h1>
          <p>Body <span>text</span></p>
        </section>
        @if (show) {
          <button>Go</button>
        }
      `,
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
    i0.ɵsetClassDebugInfo(InlineCmp, {
      className: 'InlineCmp',
      filePath: 'inline.component.ts',
      lineNumber: 15,
    });
})();

```