# /out/interpolation_complex_expressions.ngtypecheck.ts
```ts
/**
 * TCB for /interpolation_complex_expressions.ts
 * @generated
 */

import * as i0 from './interpolation_complex_expressions';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' +
      this.valueA /*138,144*/ /*138,144*/
        .getRawValue /*145,156*/
        () /*138,158*/
        ?.getTitle /*160,168*/ /*138,168*/
        ?.() /*138,170*/;
  }
}

```

# /out/interpolation_complex_expressions.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  valueA!: any;
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
        const MSG_EXTERNAL_3462388422673575127$$_INTERPOLATION_COMPLEX_EXPRESSIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$interpolation} title',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{valueA.getRawValue()?.getTitle()}}' } },
          );
        i18n_0 = MSG_EXTERNAL_3462388422673575127$$_INTERPOLATION_COMPLEX_EXPRESSIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�0�'}:INTERPOLATION: title`;
      }
      return [
        ['title', i18n_0],
        [6, 'title'],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 1);
        i0.ɵɵi18nAttributes(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵi18nExp(ctx.valueA.getRawValue()?.getTitle());
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
      <div i18n-title title="{{valueA.getRawValue()?.getTitle()}} title"></div>
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
      filePath: 'interpolation_complex_expressions.ts',
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