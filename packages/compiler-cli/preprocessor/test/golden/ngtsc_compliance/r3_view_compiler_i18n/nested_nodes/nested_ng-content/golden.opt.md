# /out/nested_ng-content.ngtypecheck.ts
```ts
/**
 * TCB for /nested_ng-content.ts
 * @generated
 */

import * as i0 from './nested_ng-content';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/nested_ng-content.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = [[['special']], '*'];
const _c1 = ['special', '*'];

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
    ['special', '*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    ngContentSelectors: _c1,
    decls: 4,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1823079451302886188$$_NESTED_NG_CONTENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagNgContent}{$closeTagNgContent}{$startTagNgContent_1}{$closeTagNgContent}',
            {
              'closeTagNgContent': '[�/#2�|�/#3�]',
              'startTagNgContent': '�#2�',
              'startTagNgContent_1': '�#3�',
            },
            {
              original_code: {
                'closeTagNgContent': '</ng-content>',
                'startTagNgContent': '<ng-content select="special">',
                'startTagNgContent_1': '<ng-content>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_1823079451302886188$$_NESTED_NG_CONTENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�#2�'}:START_TAG_NG_CONTENT:${'[�/#2�|�/#3�]'}:CLOSE_TAG_NG_CONTENT:${'�#3�'}:START_TAG_NG_CONTENT_1:${'[�/#2�|�/#3�]'}:CLOSE_TAG_NG_CONTENT:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵprojection(2);
        i0.ɵɵprojection(3, 1);
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
        <ng-content select="special"></ng-content>
        <ng-content></ng-content>
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
      filePath: 'nested_ng-content.ts',
      lineNumber: 12,
    });
})();

```