# /out/switch.ngtypecheck.ts
```ts
/**
 * TCB for /switch.ts
 * @generated
 */

import * as i0 from './switch';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    switch (this.count /*116,121*/ /*116,121*/) {
      case 0 /*140,141*/:
        break;
      case 1 /*189,190*/:
        break;
      default:
        break;
    }
  }
}

```

# /out/switch.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Case_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'span');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Case_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, 'div');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Case_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, 'button');
    i0.ɵɵi18nEnd();
  }
}

export class MyApp {
  count = 0;
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
        const MSG_EXTERNAL_532730339085995504$$_SWITCH_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Content: {$startBlockCase}before{$startTagSpan}zero{$closeTagSpan}after{$closeBlockCase}{$startBlockCase_1}before{$startTagDiv}one{$closeTagDiv}after{$closeBlockCase}{$startBlockDefault}before{$startTagButton}otherwise{$closeTagButton}after{$closeBlockDefault}',
            {
              'closeBlockCase': '[�/*2:1�|�/*3:2�]',
              'closeBlockDefault': '�/*4:3�',
              'closeTagButton': '�/#1:3�',
              'closeTagDiv': '�/#1:2�',
              'closeTagSpan': '�/#1:1�',
              'startBlockCase': '�*2:1�',
              'startBlockCase_1': '�*3:2�',
              'startBlockDefault': '�*4:3�',
              'startTagButton': '�#1:3�',
              'startTagDiv': '�#1:2�',
              'startTagSpan': '�#1:1�',
            },
            {
              original_code: {
                'closeBlockCase': '}',
                'closeBlockDefault': '}',
                'closeTagButton': '</button>',
                'closeTagDiv': '</div>',
                'closeTagSpan': '</span>',
                'startBlockCase': '@case (0) {',
                'startBlockCase_1': '@case (1) {',
                'startBlockDefault': '@default {',
                'startTagButton': '<button>',
                'startTagDiv': '<div>',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_532730339085995504$$_SWITCH_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Content: ${'�*2:1�'}:START_BLOCK_CASE:before${'�#1:1�'}:START_TAG_SPAN:zero${'�/#1:1�'}:CLOSE_TAG_SPAN:after${'[�/*2:1�|�/*3:2�]'}:CLOSE_BLOCK_CASE:${'�*3:2�'}:START_BLOCK_CASE_1:before${'�#1:2�'}:START_TAG_DIV:one${'�/#1:2�'}:CLOSE_TAG_DIV:after${'[�/*2:1�|�/*3:2�]'}:CLOSE_BLOCK_CASE:${'�*4:3�'}:START_BLOCK_DEFAULT:before${'�#1:3�'}:START_TAG_BUTTON:otherwise${'�/#1:3�'}:CLOSE_TAG_BUTTON:after${'�/*4:3�'}:CLOSE_BLOCK_DEFAULT:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 2, 0)(3, MyApp_Case_3_Template, 2, 0)(
          4,
          MyApp_Case_4_Template,
          2,
          0,
        );
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵadvance(2);
        i0.ɵɵconditional((tmp_0_0 = ctx.count) === 0 ? 2 : tmp_0_0 === 1 ? 3 : 4);
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
          @switch (count) {
            @case (0) {before<span>zero</span>after}
            @case (1) {before<div>one</div>after}
            @default {before<button>otherwise</button>after}
          }
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'switch.ts', lineNumber: 16 });
})();

```