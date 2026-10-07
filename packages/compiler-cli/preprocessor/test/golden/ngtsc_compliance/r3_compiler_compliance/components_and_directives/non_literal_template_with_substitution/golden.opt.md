# /out/non_literal_template_with_substitution.ngtypecheck.ts
```ts
/**
 * TCB for /non_literal_template_with_substitution.ts
 * @generated
 */

import * as i0 from './non_literal_template_with_substitution';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateExpression":{"start":177,"end":187}}}*/

```

# /out/non_literal_template_with_substitution.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestCmp_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1, 'Hello!');
    i0.ɵɵelementEnd();
  }
}

const greeting = 'Hello!';
const myTemplate = `<div *ngIf="show">${greeting}</div>`;

export class TestCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[4, 'ngIf']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmp_div_0_Template, 2, 0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.show);
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
                selector: 'test-cmp',
                template: myTemplate,
                standalone: false,
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
      filePath: 'non_literal_template_with_substitution.ts',
      lineNumber: 10,
    });
})();

```