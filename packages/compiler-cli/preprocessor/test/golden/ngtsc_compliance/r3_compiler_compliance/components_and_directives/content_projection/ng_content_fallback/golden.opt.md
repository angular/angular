# /out/ng_content_fallback.ngtypecheck.ts
```ts
/**
 * TCB for /ng_content_fallback.ts
 * @generated
 */

import * as i0 from './ng_content_fallback';

/*tcb1*/
function _tcb1(this: i0.TestComponent) {
  if (true) {
    '' + this.type /*200,204*/ /*200,204*/;
    if (this.hasFooter /*279,288*/ /*279,288*/) {
    }
  }
}

```

# /out/ng_content_fallback.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = [[['basic']], '*', [['footer']], [['structural']]];
const _c1 = ['basic', '*', 'footer', 'structural'];
const _c2 = ['*ngIf', 'hasStructural'];
function TestComponent_ProjectionFallback_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, 'Basic fallback');
  }
}
function TestComponent_ProjectionFallback_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, 'h1');
    i0.ɵɵtext(1);
    i0.ɵɵdomElementStart(2, 'strong');
    i0.ɵɵtext(3, 'content');
    i0.ɵɵdomElementEnd();
    i0.ɵɵtext(4, '!');
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1('This is ', ctx_r0.type, ' ');
  }
}
function TestComponent_Conditional_5_ProjectionFallback_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Inside control flow ');
  }
}
function TestComponent_Conditional_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵprojection(0, 2, null, TestComponent_Conditional_5_ProjectionFallback_0_Template, 1, 0);
  }
}
function TestComponent_ng_content_6_ProjectionFallback_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, 'h2');
    i0.ɵɵtext(1, 'With a structural directive');
    i0.ɵɵdomElementEnd();
  }
}
function TestComponent_ng_content_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵprojection(0, 3, _c2, TestComponent_ng_content_6_ProjectionFallback_0_Template, 2, 0);
  }
}

export class TestComponent {
  type = 'complex';
  hasFooter = false;
  hasStructural = false;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'test',
    never,
    {},
    {},
    never,
    ['basic', '*', 'footer', 'structural'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['test']],
    ngContentSelectors: _c1,
    decls: 7,
    vars: 2,
    consts: [[4, 'ngIf']],
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0, 0, null, TestComponent_ProjectionFallback_0_Template, 1, 0);
        i0.ɵɵdomElementStart(2, 'div');
        i0.ɵɵprojection(3, 1, null, TestComponent_ProjectionFallback_3_Template, 5, 1);
        i0.ɵɵdomElementEnd();
        i0.ɵɵconditionalCreate(5, TestComponent_Conditional_5_Template, 2, 0);
        i0.ɵɵdomTemplate(6, TestComponent_ng_content_6_Template, 2, 0, 'ng-content', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance(5);
        i0.ɵɵconditional(ctx.hasFooter ? 5 : -1);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('ngIf', ctx.hasStructural);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test',
                template: `
        <ng-content select="basic">Basic fallback</ng-content>

        <div>
          <ng-content>
            <h1>This is {{type}} <strong>content</strong>!</h1>
          </ng-content>
        </div>

        @if (hasFooter) {
          <ng-content select="footer">
            Inside control flow
          </ng-content>
        }

        <ng-content select="structural" *ngIf="hasStructural">
          <h2>With a structural directive</h2>
        </ng-content>
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
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'ng_content_fallback.ts',
      lineNumber: 25,
    });
})();

```