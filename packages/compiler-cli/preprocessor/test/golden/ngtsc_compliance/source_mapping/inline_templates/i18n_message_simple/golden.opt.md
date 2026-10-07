# /out/i18n_message_simple.ngtypecheck.ts
```ts
/**
 * TCB for /i18n_message_simple.ts
 * @generated
 */

import * as i0 from './i18n_message_simple';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
  }
}

```

# /out/i18n_message_simple.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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
    decls: 2,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2516094558146885321$$_I18N_MESSAGE_SIMPLE_TS_0 =
          /* @ts-ignore */
          goog.getMsg('Hello, World!');
        i18n_0 = MSG_EXTERNAL_2516094558146885321$$_I18N_MESSAGE_SIMPLE_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello, World!`;
      }
      return [i18n_0];
    },
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
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
                template: '<div i18n>Hello, World!</div>',
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
      filePath: 'i18n_message_simple.ts',
      lineNumber: 8,
    });
})();

```