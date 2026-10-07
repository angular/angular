# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.TestComponent) {
  if (true) {
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateExpression":{"start":133,"end":153}}}*/

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { GREETING } from './constants';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['test-cmp']],
    decls: 2,
    vars: 0,
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'p');
        i0.ɵɵtext(1, 'Hello!');
        i0.ɵɵdomElementEnd();
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
                selector: 'test-cmp',
                template: `<p>${GREETING}</p>`,
                standalone: true,
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
      filePath: 'app.component.ts',
      lineNumber: 9,
    });
})();

```