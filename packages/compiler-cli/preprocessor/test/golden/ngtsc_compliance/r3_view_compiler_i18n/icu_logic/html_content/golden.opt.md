# /out/html_content.ngtypecheck.ts
```ts
/**
 * TCB for /html_content.ts
 * @generated
 */

import * as i0 from './html_content';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.gender /*129,135*/ /*129,135*/;
  }
}

```

# /out/html_content.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  gender = 'female';
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 5,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2417296354340576868$$_HTML_CONTENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_SELECT, select, male {male - {START_BOLD_TEXT}male{CLOSE_BOLD_TEXT}} female {female {START_BOLD_TEXT}female{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}{START_ITALIC_TEXT}other{CLOSE_ITALIC_TEXT}{CLOSE_TAG_DIV}}}',
          );
        i18n_0 = MSG_EXTERNAL_2417296354340576868$$_HTML_CONTENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, male {male - {START_BOLD_TEXT}male{CLOSE_BOLD_TEXT}} female {female {START_BOLD_TEXT}female{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}{START_ITALIC_TEXT}other{CLOSE_ITALIC_TEXT}{CLOSE_TAG_DIV}}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        'CLOSE_BOLD_TEXT': '</b>',
        'CLOSE_ITALIC_TEXT': '</i>',
        'CLOSE_TAG_DIV': '</div>',
        'START_BOLD_TEXT': '<b>',
        'START_ITALIC_TEXT': '<i>',
        'START_TAG_DIV': '<div class="other">',
        'VAR_SELECT': '�0�',
      });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2500076286225379125$$_HTML_CONTENT_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            ' {$icu} {$startBoldText}Other content{$closeBoldText}{$startTagDiv}{$startItalicText}Another content{$closeItalicText}{$closeTagDiv}',
            {
              'closeBoldText': '�/#2�',
              'closeItalicText': '�/#4�',
              'closeTagDiv': '�/#3�',
              'icu': i18n_0,
              'startBoldText': '�#2�',
              'startItalicText': '�#4�',
              'startTagDiv': '�#3�',
            },
            {
              original_code: {
                'closeBoldText': '</b>',
                'closeItalicText': '</i>',
                'closeTagDiv': '</div>',
                'icu':
                  '{gender, select, male {male - <b>male</b>} female {female <b>female</b>} other {<div class="other"><i>other</i></div>}}',
                'startBoldText': '<b>',
                'startItalicText': '<i>',
                'startTagDiv': '<div class="other">',
              },
            },
          );
        i18n_1 = MSG_EXTERNAL_2500076286225379125$$_HTML_CONTENT_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize` ${i18n_0}:ICU@@4731057199984078679: ${'�#2�'}:START_BOLD_TEXT:Other content${'�/#2�'}:CLOSE_BOLD_TEXT:${'�#3�'}:START_TAG_DIV:${'�#4�'}:START_ITALIC_TEXT:Another content${'�/#4�'}:CLOSE_ITALIC_TEXT:${'�/#3�'}:CLOSE_TAG_DIV:`;
      }
      return [i18n_1, [1, 'other']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, 'b');
        i0.ɵɵelementStart(3, 'div', 1);
        i0.ɵɵelement(4, 'i');
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(ctx.gender);
        i0.ɵɵi18nApply(1);
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
        {gender, select, male {male - <b>male</b>} female {female <b>female</b>} other {<div class="other"><i>other</i></div>}}
        <b>Other content</b>
        <div class="other"><i>Another content</i></div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'html_content.ts',
      lineNumber: 14,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```