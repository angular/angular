# /out/i18n_message_placeholder.ngtypecheck.ts
```ts
/**
 * TCB for /i18n_message_placeholder.ts
 * @generated
 */

import * as i0 from './i18n_message_placeholder';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    '' + this.name /*115,119*/ /*115,119*/;
  }
}

```

# /out/i18n_message_placeholder.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  name: string = '';
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
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3837190144703024674$$_I18N_MESSAGE_PLACEHOLDER_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Hello, {$interpolation}!',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{name}}' } },
          );
        i18n_0 = MSG_EXTERNAL_3837190144703024674$$_I18N_MESSAGE_PLACEHOLDER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello, ${'�0�'}:INTERPOLATION:!`;
      }
      return [i18n_0];
    },
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.name);
        i0.ɵɵi18nApply(1);
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
                template: '<div i18n>Hello, {{name}}!</div>',
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
      filePath: 'i18n_message_placeholder.ts',
      lineNumber: 8,
    });
})();

```