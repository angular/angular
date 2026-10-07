# /out/defer.ngtypecheck.ts
```ts
/**
 * TCB for /defer.ts
 * @generated
 */

import * as i0 from './defer';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    if (this.isLoaded /*120,128*/ /*120,128*/) {
    }
  }
}

```

# /out/defer.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'span');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_DeferLoading_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, 'button');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_DeferPlaceholder_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, 'div');
    i0.ɵɵi18nEnd();
  }
}
function MyApp_DeferError_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 4);
    i0.ɵɵelement(1, 'h1');
    i0.ɵɵi18nEnd();
  }
}

export class MyApp {
  isLoaded = false;
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
    decls: 8,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7863738818382242773$$_DEFER_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Content: {$startBlockDefer} before{$startTagSpan}middle{$closeTagSpan}after {$closeBlockDefer}{$startBlockPlaceholder} before{$startTagDiv}placeholder{$closeTagDiv}after {$closeBlockPlaceholder}{$startBlockLoading} before{$startTagButton}loading{$closeTagButton}after {$closeBlockLoading}{$startBlockError} before{$startHeadingLevel1}error{$closeHeadingLevel1}after {$closeBlockError}',
            {
              'closeBlockDefer': '�/*2:1�',
              'closeBlockError': '�/*5:4�',
              'closeBlockLoading': '�/*3:2�',
              'closeBlockPlaceholder': '�/*4:3�',
              'closeHeadingLevel1': '�/#1:4�',
              'closeTagButton': '�/#1:2�',
              'closeTagDiv': '�/#1:3�',
              'closeTagSpan': '�/#1:1�',
              'startBlockDefer': '�*2:1�',
              'startBlockError': '�*5:4�',
              'startBlockLoading': '�*3:2�',
              'startBlockPlaceholder': '�*4:3�',
              'startHeadingLevel1': '�#1:4�',
              'startTagButton': '�#1:2�',
              'startTagDiv': '�#1:3�',
              'startTagSpan': '�#1:1�',
            },
            {
              original_code: {
                'closeBlockDefer': '}',
                'closeBlockError': '}',
                'closeBlockLoading': '}',
                'closeBlockPlaceholder': '}',
                'closeHeadingLevel1': '</h1>',
                'closeTagButton': '</button>',
                'closeTagDiv': '</div>',
                'closeTagSpan': '</span>',
                'startBlockDefer': '@defer (when isLoaded) {',
                'startBlockError': '@error {',
                'startBlockLoading': '@loading {',
                'startBlockPlaceholder': '@placeholder {',
                'startHeadingLevel1': '<h1>',
                'startTagButton': '<button>',
                'startTagDiv': '<div>',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_7863738818382242773$$_DEFER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Content: ${'�*2:1�'}:START_BLOCK_DEFER: before${'�#1:1�'}:START_TAG_SPAN:middle${'�/#1:1�'}:CLOSE_TAG_SPAN:after ${'�/*2:1�'}:CLOSE_BLOCK_DEFER:${'�*4:3�'}:START_BLOCK_PLACEHOLDER: before${'�#1:3�'}:START_TAG_DIV:placeholder${'�/#1:3�'}:CLOSE_TAG_DIV:after ${'�/*4:3�'}:CLOSE_BLOCK_PLACEHOLDER:${'�*3:2�'}:START_BLOCK_LOADING: before${'�#1:2�'}:START_TAG_BUTTON:loading${'�/#1:2�'}:CLOSE_TAG_BUTTON:after ${'�/*3:2�'}:CLOSE_BLOCK_LOADING:${'�*5:4�'}:START_BLOCK_ERROR: before${'�#1:4�'}:START_HEADING_LEVEL1:error${'�/#1:4�'}:CLOSE_HEADING_LEVEL1:after ${'�/*5:4�'}:CLOSE_BLOCK_ERROR:`;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 2, 0)(3, MyApp_DeferLoading_3_Template, 2, 0)(
          4,
          MyApp_DeferPlaceholder_4_Template,
          2,
          0,
        )(5, MyApp_DeferError_5_Template, 2, 0);
        i0.ɵɵdefer(6, 2, null, 3, 4, 5);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(6);
        i0.ɵɵdeferWhen(ctx.isLoaded);
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
          @defer (when isLoaded) {
            before<span>middle</span>after
          } @placeholder {
            before<div>placeholder</div>after
          } @loading {
            before<button>loading</button>after
          } @error {
            before<h1>error</h1>after
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'defer.ts', lineNumber: 20 });
})();

```