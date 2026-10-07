# /out/inline_template_non_legacy_normalized.ngtypecheck.ts
```ts
/**
 * TCB for /inline_template_non_legacy_normalized.ts
 * @generated
 */

import * as i0 from './inline_template_non_legacy_normalized';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.value /*342,347*/ /*342,347*/;
  }
}

```

# /out/inline_template_non_legacy_normalized.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  value!: any;
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
    decls: 2,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7326958852138509669$$_INLINE_TEMPLATE_NON_LEGACY_NORMALIZED_TS_0 =
          /* @ts-ignore */
          goog.getMsg('abc\ndef');
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$_INLINE_TEMPLATE_NON_LEGACY_NORMALIZED_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`abc
def`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4863953183043480207$$_INLINE_TEMPLATE_NON_LEGACY_NORMALIZED_TS_1 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, =0 {zero\n  }}');
        i18n_1 = MSG_EXTERNAL_4863953183043480207$$_INLINE_TEMPLATE_NON_LEGACY_NORMALIZED_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, =0 {zero
  }}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'VAR_SELECT': '�0�' });
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2773178924738647105$$_INLINE_TEMPLATE_NON_LEGACY_NORMALIZED_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            '\nSome Message\n{$icu}',
            { 'icu': i18n_1 },
            {
              original_code: {
                'icu': '{\r\n  value,\r\n  select,\r\n  =0 {\r\n    zero\r\n  }\r\n}',
              },
            },
          );
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$_INLINE_TEMPLATE_NON_LEGACY_NORMALIZED_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`
Some Message
${i18n_1}:ICU@@7530413425895265894:`;
      }
      return [i18n_2, ['title', i18n_0]];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 1);
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.value);
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
                // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                template: `
    <div title="abc
    def" i18n-title i18n>
    Some Message
    {
      value,
      select,
      =0 {
        zero
      }
    }</div>`,
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
      filePath: 'inline_template_non_legacy_normalized.ts',
      lineNumber: 20,
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