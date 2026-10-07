# /out/sibling_i18n_blocks.ngtypecheck.ts
```ts
/**
 * TCB for /sibling_i18n_blocks.ts
 * @generated
 */

import * as i0 from './sibling_i18n_blocks';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/sibling_i18n_blocks.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
  }
}
function MyComponent_ng_template_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 1, 1);
  }
}

export class MyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    decls: 6,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2794571749861951181$$_SIBLING_I18N_BLOCKS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagNgTemplate}Content A{$closeTagNgTemplate}',
            { 'closeTagNgTemplate': '�/*2:1�', 'startTagNgTemplate': '�*2:1�' },
            {
              original_code: {
                'closeTagNgTemplate': '</ng-template>',
                'startTagNgTemplate': '<ng-template>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_2794571749861951181$$_SIBLING_I18N_BLOCKS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�*2:1�'}:START_TAG_NG_TEMPLATE:Content A${'�/*2:1�'}:CLOSE_TAG_NG_TEMPLATE:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3741326655422864774$$_SIBLING_I18N_BLOCKS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagNgTemplate}Content B{$closeTagNgTemplate}',
            { 'closeTagNgTemplate': '�/*5:1�', 'startTagNgTemplate': '�*5:1�' },
            {
              original_code: {
                'closeTagNgTemplate': '</ng-template>',
                'startTagNgTemplate': '<ng-template>',
              },
            },
          );
        i18n_1 = MSG_EXTERNAL_3741326655422864774$$_SIBLING_I18N_BLOCKS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${'�*5:1�'}:START_TAG_NG_TEMPLATE:Content B${'�/*5:1�'}:CLOSE_TAG_NG_TEMPLATE:`;
      }
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomTemplate(2, MyComponent_ng_template_2_Template, 1, 0, 'ng-template');
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(3, 'div');
        i0.ɵɵi18nStart(4, 1);
        i0.ɵɵdomTemplate(5, MyComponent_ng_template_5_Template, 1, 0, 'ng-template');
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component',
                template: `
      <div i18n>
        <ng-template>Content A</ng-template>
      </div>
      <div i18n>
        <ng-template>Content B</ng-template>
      </div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'sibling_i18n_blocks.ts',
      lineNumber: 14,
    });
})();

```