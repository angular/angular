# /out/preserve_inner_content.ngtypecheck.ts
```ts
/**
 * TCB for /preserve_inner_content.ts
 * @generated
 */

import * as i0 from './preserve_inner_content';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/preserve_inner_content.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 5,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5871145577455911624$$_PRESERVE_INNER_CONTENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '\n    Some text\n    {$startTagSpan}Text inside span{$closeTagSpan}\n  ',
            { 'closeTagSpan': '�/#3�', 'startTagSpan': '�#3�' },
            { original_code: { 'closeTagSpan': '</span>', 'startTagSpan': '<span>' } },
          );
        i18n_0 = MSG_EXTERNAL_5871145577455911624$$_PRESERVE_INNER_CONTENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`
    Some text
    ${'�#3�'}:START_TAG_SPAN:Text inside span${'�/#3�'}:CLOSE_TAG_SPAN:
  `;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, '\n  ');
        i0.ɵɵelementStart(1, 'div');
        i0.ɵɵi18nStart(2, 0);
        i0.ɵɵelement(3, 'span');
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵtext(4, '\n');
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
        Some text
        <span>Text inside span</span>
      </div>
    `,
                preserveWhitespaces: true,
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
      filePath: 'preserve_inner_content.ts',
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