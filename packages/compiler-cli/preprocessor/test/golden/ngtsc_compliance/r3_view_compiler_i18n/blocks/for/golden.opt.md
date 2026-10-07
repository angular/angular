# /out/for.ngtypecheck.ts
```ts
/**
 * TCB for /for.ts
 * @generated
 */

import * as i0 from './for';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*113,117*/ of this.items /*121,126*/ /*121,126*/! /*121,126*/) {
      _t1 /*134,138*/;
    }
  }
}

```

# /out/for.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'span');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_ForEmpty_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, 'div');
    i0.ɵɵi18nEnd();
  }
}

export class MyApp {
  items = [1, 2, 3];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 5,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7811380212725452224$$_FOR_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Content: {$startBlockFor} before{$startTagSpan}middle{$closeTagSpan}after {$closeBlockFor}{$startBlockEmpty} before{$startTagDiv}empty{$closeTagDiv}after {$closeBlockEmpty}! ',
            {
              'closeBlockEmpty': '�/*4:2�',
              'closeBlockFor': '�/*3:1�',
              'closeTagDiv': '�/#1:2�',
              'closeTagSpan': '�/#1:1�',
              'startBlockEmpty': '�*4:2�',
              'startBlockFor': '�*3:1�',
              'startTagDiv': '�#1:2�',
              'startTagSpan': '�#1:1�',
            },
            {
              original_code: {
                'closeBlockEmpty': '}',
                'closeBlockFor': '}',
                'closeTagDiv': '</div>',
                'closeTagSpan': '</span>',
                'startBlockEmpty': '@empty {',
                'startBlockFor': '@for (item of items; track item) {',
                'startTagDiv': '<div>',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_7811380212725452224$$_FOR_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Content: ${'�*3:1�'}:START_BLOCK_FOR: before${'�#1:1�'}:START_TAG_SPAN:middle${'�/#1:1�'}:CLOSE_TAG_SPAN:after ${'�/*3:1�'}:CLOSE_BLOCK_FOR:${'�*4:2�'}:START_BLOCK_EMPTY: before${'�#1:2�'}:START_TAG_DIV:empty${'�/#1:2�'}:CLOSE_TAG_DIV:after ${'�/*4:2�'}:CLOSE_BLOCK_EMPTY:! `;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          2,
          0,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
          false,
          MyApp_ForEmpty_4_Template,
          2,
          0,
        );
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵrepeater(ctx.items);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <div i18n>
          Content:
          @for (item of items; track item) {
            before<span>middle</span>after
          } @empty {
            before<div>empty</div>after
          }!
        </div>
      `,
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'for.ts', lineNumber: 16 });
})();

```