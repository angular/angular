# /out/external_template_legacy_normalized.ngtypecheck.ts
```ts
/**
 * TCB for /external_template_legacy_normalized.ts
 * @generated
 */

import * as i0 from './external_template_legacy_normalized';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.value /*338,343*/ /*338,343*/;
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateFile":"/template.html"}}*/

```

# /out/external_template_legacy_normalized.ts
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
        const MSG_EXTERNAL_7326958852138509669$$_EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_0 =
          /* @ts-ignore */
          goog.getMsg('abc\ndef');
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$_EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:␟4f9ce2c66b187afd9898b25f6336d1eb2be8b5dc␟7326958852138509669:abc
def`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2056861121373082280$$_EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_1 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, =0 {zero\n    }}');
        i18n_1 = MSG_EXTERNAL_2056861121373082280$$_EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`:␟47e6af99f2e9137a977cf8c7bf39d091d339ae3a␟2056861121373082280:{VAR_SELECT, select, =0 {zero
    }}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'VAR_SELECT': '�0�' });
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6752545234037626269$$_EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            ' Some Message {$icu}',
            { 'icu': i18n_1 },
            {
              original_code: {
                'icu': '{\r\n    value,\r\n    select,\r\n    =0 {\r\n      zero\r\n    }\r\n  }',
              },
            },
          );
        i18n_2 = MSG_EXTERNAL_6752545234037626269$$_EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`:␟23ea0658f9e9f6c61c9e2798fff0f4b11c509fae␟6752545234037626269: Some Message ${i18n_1}:ICU:`;
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
                standalone: false,
                template:
                  '<!--\n  NOTE: This template has escaped `\\r\\n` line-endings markers that will be converted to real `\\r\\n` line-ending chars when loaded from the test file-system.\n        This conversion happens in the monkeyPatchReadFile() function, which changes `fs.readFile()`.\n-->\n<div title="abc\r\ndef" i18n-title i18n>\r\n  Some Message\r\n  {\r\n    value,\r\n    select,\r\n    =0 {\r\n      zero\r\n    }\r\n  }</div>',
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
      filePath: 'external_template_legacy_normalized.ts',
      lineNumber: 10,
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