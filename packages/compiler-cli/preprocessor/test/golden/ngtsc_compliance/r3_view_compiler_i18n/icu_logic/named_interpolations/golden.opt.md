# /out/named_interpolations.ngtypecheck.ts
```ts
/**
 * TCB for /named_interpolations.ts
 * @generated
 */

import * as i0 from './named_interpolations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.gender /*134,140*/ /*134,140*/;
    '' + this.weight /*169,175*/ /*169,175*/;
    '' + this.height /*223,229*/ /*223,229*/;
    '' + this.age /*275,278*/ /*275,278*/;
  }
}

```

# /out/named_interpolations.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  gender = 'male';
  weight = 1;
  height = 1;
  age = 1;
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
    vars: 4,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6318060397235942326$$_NAMED_INTERPOLATIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}',
          );
        i18n_0 = MSG_EXTERNAL_6318060397235942326$$_NAMED_INTERPOLATIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        'PH_WITH_SPACES': '�3�',
        'PH_A': '�1�',
        'PH_B': '�2�',
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
        i0.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height)(ctx.age);
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
      <div i18n>{
        gender,
        select,
          male {male {{ weight // i18n(ph="PH_A") }}}
          female {female {{ height // i18n(ph="PH_B") }}}
          other {other {{ age // i18n(ph="PH WITH SPACES") }}}
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
      filePath: 'named_interpolations.ts',
      lineNumber: 16,
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