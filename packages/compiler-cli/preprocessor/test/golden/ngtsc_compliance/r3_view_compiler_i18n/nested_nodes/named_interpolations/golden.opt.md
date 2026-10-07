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
    '' + this.valueA /*148,154*/ /*148,154*/ + this.valueB /*213,219*/ /*213,219*/;
  }
}

```

# /out/named_interpolations.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  valueA = '';
  valueB = '';
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
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8886186367501632276$$_NAMED_INTERPOLATIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Named interpolation: {$phA} Named interpolation with spaces: {$phB} ',
            { 'phB': '�1�', 'phA': '�0�' },
            {
              original_code: {
                'phB': '{{ valueB // i18n(ph="PH B") }}',
                'phA': '{{ valueA // i18n(ph="PH_A") }}',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_8886186367501632276$$_NAMED_INTERPOLATIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Named interpolation: ${'�0�'}:PH_A: Named interpolation with spaces: ${'�1�'}:PH_B: `;
      }
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
        i0.ɵɵi18nExp(ctx.valueA)(ctx.valueB);
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
        Named interpolation: {{ valueA // i18n(ph="PH_A") }}
        Named interpolation with spaces: {{ valueB // i18n(ph="PH B") }}
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
      filePath: 'named_interpolations.ts',
      lineNumber: 13,
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