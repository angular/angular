# /out/i18n_message_container_tag.ngtypecheck.ts
```ts
/**
 * TCB for /i18n_message_container_tag.ts
 * @generated
 */

import * as i0 from './i18n_message_container_tag';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
  }
}

```

# /out/i18n_message_container_tag.ts
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
    decls: 3,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4904146394253881807$$_I18N_MESSAGE_CONTAINER_TAG_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Hello, {$startBoldText}World{$closeBoldText}!',
            { 'closeBoldText': '�/#2�', 'startBoldText': '�#2�' },
            { original_code: { 'closeBoldText': '</b>', 'startBoldText': '<b>' } },
          );
        i18n_0 = MSG_EXTERNAL_4904146394253881807$$_I18N_MESSAGE_CONTAINER_TAG_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello, ${'�#2�'}:START_BOLD_TEXT:World${'�/#2�'}:CLOSE_BOLD_TEXT:!`;
      }
      return [i18n_0];
    },
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, 'b');
        i0.ɵɵi18nEnd();
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
                template: '<div i18n>Hello, <b>World</b>!</div>',
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
      filePath: 'i18n_message_container_tag.ts',
      lineNumber: 8,
    });
})();

```