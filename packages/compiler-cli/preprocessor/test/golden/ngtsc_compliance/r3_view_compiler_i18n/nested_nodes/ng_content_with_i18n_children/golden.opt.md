# /out/ng_content_with_i18n_children.ngtypecheck.ts
```ts
/**
 * TCB for /ng_content_with_i18n_children.ts
 * @generated
 */

import * as i0 from './ng_content_with_i18n_children';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/ng_content_with_i18n_children.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];
function MyComponent_ProjectionFallback_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, 'span');
    i0.ɵɵi18nStart(1, 0);
    i0.ɵɵdomElement(2, 'b');
    i0.ɵɵi18nEnd();
    i0.ɵɵdomElementEnd();
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
    ['*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    ngContentSelectors: _c0,
    decls: 2,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_MY_ID$$_NG_CONTENT_WITH_I18N_CHILDREN_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'a {$startBoldText}b{$closeBoldText} c',
            { 'closeBoldText': '�/#2�', 'startBoldText': '�#2�' },
            { original_code: { 'closeBoldText': '</b>', 'startBoldText': '<b>' } },
          );
        i18n_0 = MSG_EXTERNAL_MY_ID$$_NG_CONTENT_WITH_I18N_CHILDREN_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:@@MY_ID:a ${'�#2�'}:START_BOLD_TEXT:b${'�/#2�'}:CLOSE_BOLD_TEXT: c`;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵprojection(0, 0, null, MyComponent_ProjectionFallback_0_Template, 3, 0);
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
        <ng-content>
          <span i18n="@@MY_ID">a <b>b</b> c</span>
        </ng-content>
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
      filePath: 'ng_content_with_i18n_children.ts',
      lineNumber: 11,
    });
})();

```