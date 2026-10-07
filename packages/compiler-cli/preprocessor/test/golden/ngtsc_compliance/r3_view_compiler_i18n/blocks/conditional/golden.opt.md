# /out/conditional.ngtypecheck.ts
```ts
/**
 * TCB for /conditional.ts
 * @generated
 */

import * as i0 from './conditional';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    if (this.count /*112,117*/ /*112,117*/ === 0 /*122,123*/ /*112,123*/) {
    } else if (this.count /*182,187*/ /*182,187*/ === 1 /*192,193*/ /*182,193*/) {
    } else {
    }
    if (this.count /*314,319*/ /*314,319*/ === 7 /*324,325*/ /*314,325*/) {
    }
  }
}

```

# /out/conditional.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'span');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Conditional_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, 'div');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Conditional_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, 'button');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Conditional_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 4);
    i0.ɵɵelement(1, 'span');
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
    decls: 6,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4037030454066434177$$_CONDITIONAL_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Content: {$startBlockIf} before{$startTagSpan}zero{$closeTagSpan}after {$closeBlockIf}{$startBlockElseIf} before{$startTagDiv}one{$closeTagDiv}after {$closeBlockElseIf}{$startBlockElse} before{$startTagButton}otherwise{$closeTagButton}after {$closeBlockElse}! {$startBlockIf_1} before{$startTagSpan}seven{$closeTagSpan}after {$closeBlockIf}',
            {
              'closeBlockElse': '�/*4:3�',
              'closeBlockElseIf': '�/*3:2�',
              'closeBlockIf': '[�/*2:1�|�/*5:4�]',
              'closeTagButton': '�/#1:3�',
              'closeTagDiv': '�/#1:2�',
              'closeTagSpan': '[�/#1:1�|�/#1:4�]',
              'startBlockElse': '�*4:3�',
              'startBlockElseIf': '�*3:2�',
              'startBlockIf': '�*2:1�',
              'startBlockIf_1': '�*5:4�',
              'startTagButton': '�#1:3�',
              'startTagDiv': '�#1:2�',
              'startTagSpan': '[�#1:1�|�#1:4�]',
            },
            {
              original_code: {
                'closeBlockElse': '}',
                'closeBlockElseIf': '}',
                'closeBlockIf': '}',
                'closeTagButton': '</button>',
                'closeTagDiv': '</div>',
                'closeTagSpan': '</span>',
                'startBlockElse': '@else {',
                'startBlockElseIf': '@else if (count === 1) {',
                'startBlockIf': '@if (count === 0) {',
                'startBlockIf_1': '@if (count === 7) {',
                'startTagButton': '<button>',
                'startTagDiv': '<div>',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_4037030454066434177$$_CONDITIONAL_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Content: ${'�*2:1�'}:START_BLOCK_IF: before${'[�#1:1�|�#1:4�]'}:START_TAG_SPAN:zero${'[�/#1:1�|�/#1:4�]'}:CLOSE_TAG_SPAN:after ${'[�/*2:1�|�/*5:4�]'}:CLOSE_BLOCK_IF:${'�*3:2�'}:START_BLOCK_ELSE_IF: before${'�#1:2�'}:START_TAG_DIV:one${'�/#1:2�'}:CLOSE_TAG_DIV:after ${'�/*3:2�'}:CLOSE_BLOCK_ELSE_IF:${'�*4:3�'}:START_BLOCK_ELSE: before${'�#1:3�'}:START_TAG_BUTTON:otherwise${'�/#1:3�'}:CLOSE_TAG_BUTTON:after ${'�/*4:3�'}:CLOSE_BLOCK_ELSE:! ${'�*5:4�'}:START_BLOCK_IF_1: before${'[�#1:1�|�#1:4�]'}:START_TAG_SPAN:seven${'[�/#1:1�|�/#1:4�]'}:CLOSE_TAG_SPAN:after ${'[�/*2:1�|�/*5:4�]'}:CLOSE_BLOCK_IF:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 2, 0)(
          3,
          MyApp_Conditional_3_Template,
          2,
          0,
        )(4, MyApp_Conditional_4_Template, 2, 0);
        i0.ɵɵconditionalCreate(5, MyApp_Conditional_5_Template, 2, 0);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵconditional(ctx.count === 0 ? 2 : ctx.count === 1 ? 3 : 4);
        i0.ɵɵadvance(3);
        i0.ɵɵconditional(ctx.count === 7 ? 5 : -1);
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
          @if (count === 0) {
            before<span>zero</span>after
          } @else if (count === 1) {
            before<div>one</div>after
          } @else {
            before<button>otherwise</button>after
          }!

          @if (count === 7) {
            before<span>seven</span>after
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'conditional.ts',
      lineNumber: 22,
    });
})();

```