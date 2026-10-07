# /out/legacy_enabled.ngtypecheck.ts
```ts
/**
 * TCB for /legacy_enabled.ts
 * @generated
 */

import * as i0 from './legacy_enabled';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + 'interpolated' /*240,254*/;
    '' + 'interpolated' /*300,314*/;
  }
}

```

# /out/legacy_enabled.ts
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
    decls: 13,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2908931752694090721$$_LEGACY_ENABLED_TS_0 =
          /* @ts-ignore */
          goog.getMsg('Some & attribute');
        i18n_0 = MSG_EXTERNAL_2908931752694090721$$_LEGACY_ENABLED_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:␟82ec661067f503a3357ecc159b2128325e9208cd␟2908931752694090721:Some & attribute`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2720535395337591908$$_LEGACY_ENABLED_TS_1 =
          /* @ts-ignore */
          goog.getMsg('"');
        i18n_1 = MSG_EXTERNAL_2720535395337591908$$_LEGACY_ENABLED_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`:␟5b30d888e99e7c6cfc6265f89c39b5921805cd2e␟2720535395337591908:"`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3600934704948217447$$_LEGACY_ENABLED_TS_2 =
          /* @ts-ignore */
          goog.getMsg('""');
        i18n_2 = MSG_EXTERNAL_3600934704948217447$$_LEGACY_ENABLED_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`:␟bdfdbea9161864191756930161fd41b8bc980fde␟3600934704948217447:""`;
      }
      let i18n_3;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2334195497629636162$$_LEGACY_ENABLED_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            'Some & {$interpolation} attribute',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': "{{'interpolated'}}" } },
          );
        i18n_3 = MSG_EXTERNAL_2334195497629636162$$_LEGACY_ENABLED_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize`:␟57ebd20267116c04cc1dbd7be0b73bf56484f45d␟2334195497629636162:Some & ${'�0�'}:INTERPOLATION: attribute`;
      }
      let i18n_4;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4700340487900776701$$_LEGACY_ENABLED_TS_4 =
          /* @ts-ignore */
          goog.getMsg('Some & message');
        i18n_4 = MSG_EXTERNAL_4700340487900776701$$_LEGACY_ENABLED_TS_4;
      } else {
        /* @ts-ignore */
        i18n_4 = $localize`:␟10adaf0ad7b8ba40200cd3c0e7c8d0f13280d522␟4700340487900776701:Some & message`;
      }
      let i18n_5;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3204054277547499090$$_LEGACY_ENABLED_TS_5 =
          /* @ts-ignore */
          goog.getMsg(
            'Some & {$interpolation} message',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': "{{'interpolated' }}" } },
          );
        i18n_5 = MSG_EXTERNAL_3204054277547499090$$_LEGACY_ENABLED_TS_5;
      } else {
        /* @ts-ignore */
        i18n_5 = $localize`:␟28d558ca32556f1da67a333e3dada321a97212cd␟3204054277547499090:Some & ${'�0�'}:INTERPOLATION: message`;
      }
      let i18n_6;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2406634758623728945$$_LEGACY_ENABLED_TS_6 =
          /* @ts-ignore */
          goog.getMsg('&');
        i18n_6 = MSG_EXTERNAL_2406634758623728945$$_LEGACY_ENABLED_TS_6;
      } else {
        /* @ts-ignore */
        i18n_6 = $localize`:␟0b3dff7b9382b6217ac97c99f9b04df04381bfdd␟2406634758623728945:&`;
      }
      let i18n_7;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4156372478368653226$$_LEGACY_ENABLED_TS_7 =
          /* @ts-ignore */
          goog.getMsg('&"');
        i18n_7 = MSG_EXTERNAL_4156372478368653226$$_LEGACY_ENABLED_TS_7;
      } else {
        /* @ts-ignore */
        i18n_7 = $localize`:␟25b7cbf210e59a931423097cb7f2e1b72991a687␟4156372478368653226:&"`;
      }
      return [
        i18n_4,
        i18n_5,
        i18n_6,
        i18n_7,
        ['title', i18n_3],
        ['title', i18n_0],
        [6, 'title'],
        ['title', i18n_1],
        ['title', i18n_2],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 5);
        i0.ɵɵelementStart(1, 'div');
        i0.ɵɵi18n(2, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, 'div', 6);
        i0.ɵɵi18nAttributes(4, 4);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(5, 'div');
        i0.ɵɵi18n(6, 1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(7, 'div');
        i0.ɵɵi18n(8, 2);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(9, 'div');
        i0.ɵɵi18n(10, 3);
        i0.ɵɵelementEnd();
        i0.ɵɵelement(11, 'div', 7)(12, 'div', 8);
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp('interpolated');
        i0.ɵɵi18nApply(4);
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp('interpolated');
        i0.ɵɵi18nApply(6);
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
      <div i18n-title title="Some &amp; attribute"></div>
      <div i18n>Some &amp; message</div>
      <div i18n-title title="Some &amp; {{'interpolated'}} attribute"></div>
      <div i18n>Some &amp; {{'interpolated' }} message</div>
      <div i18n>&amp;</div>
      <div i18n>&amp;&quot;</div>
      <div i18n-title title="&quot;"></div>
      <div i18n-title title="&quot;&quot;"></div>
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
      filePath: 'legacy_enabled.ts',
      lineNumber: 17,
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