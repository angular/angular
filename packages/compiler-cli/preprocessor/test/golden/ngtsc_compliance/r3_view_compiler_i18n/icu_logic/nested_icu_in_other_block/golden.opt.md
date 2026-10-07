# /out/nested_icu_in_other_block.ngtypecheck.ts
```ts
/**
 * TCB for /nested_icu_in_other_block.ts
 * @generated
 */

import * as i0 from './nested_icu_in_other_block';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.name /*172,176*/ /*172,176*/;
    '' + this.count /*124,129*/ /*124,129*/;
    '' + this.count /*279,284*/ /*279,284*/;
  }
}

```

# /out/nested_icu_in_other_block.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  count = 0;
  name = 'Andrew';
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
    vars: 3,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6870293071705078389$$_NESTED_ICU_IN_OTHER_BLOCK_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}} !} other {other - {INTERPOLATION}}}',
          );
        i18n_0 = MSG_EXTERNAL_6870293071705078389$$_NESTED_ICU_IN_OTHER_BLOCK_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}} !} other {other - {INTERPOLATION}}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        'INTERPOLATION': '�2�',
        'VAR_PLURAL': '�1�',
        'VAR_SELECT': '�0�',
      });
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.name)(ctx.count)(ctx.count);
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
      <div i18n>{count, plural,
        =0 {zero}
        =2 {{{count}} {name, select,
              cat {cats}
              dog {dogs}
              other {animals}} !}
        other {other - {{count}}}
      }</div>
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
      filePath: 'nested_icu_in_other_block.ts',
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