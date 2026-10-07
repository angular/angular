# /out/repeated_placeholder.ngtypecheck.ts
```ts
/**
 * TCB for /repeated_placeholder.ts
 * @generated
 */

import * as i0 from './repeated_placeholder';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.placeholder /*135,146*/ /*135,146*/ + this.placeholder /*174,185*/ /*174,185*/;
    '' + this.placeholder /*220,231*/ /*220,231*/ + this.placeholder /*270,281*/ /*270,281*/;
  }
}

```

# /out/repeated_placeholder.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  placeholder: any;
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
    decls: 4,
    vars: 4,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5630555247629532920$$_REPEATED_PLACEHOLDER_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Hello, {$interpolation}! You are a very good {$interpolation}.',
            { 'interpolation': '[�0�|�1�]' },
            { original_code: { 'interpolation': '{{ placeholder }}' } },
          );
        i18n_0 = MSG_EXTERNAL_5630555247629532920$$_REPEATED_PLACEHOLDER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello, ${'[�0�|�1�]'}:INTERPOLATION:! You are a very good ${'[�0�|�1�]'}:INTERPOLATION:.`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8920820792479556534$$_REPEATED_PLACEHOLDER_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            'Hello, {$ph}! Hello again {$ph}.',
            { 'ph': '[�0�|�1�]' },
            { original_code: { 'ph': '{{ placeholder // i18n(ph = "ph") }}' } },
          );
        i18n_1 = MSG_EXTERNAL_8920820792479556534$$_REPEATED_PLACEHOLDER_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`Hello, ${'[�0�|�1�]'}:PH:! Hello again ${'[�0�|�1�]'}:PH:.`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1);
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'div');
        i0.ɵɵi18n(3, 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.placeholder)(ctx.placeholder);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.placeholder)(ctx.placeholder);
        i0.ɵɵi18nApply(3);
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
        <div i18n>Hello, {{ placeholder }}! You are a very good {{ placeholder }}.</div>
        <div i18n>Hello, {{ placeholder // i18n(ph = "ph") }}! Hello again {{ placeholder // i18n(ph = "ph") }}.</div>
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
      filePath: 'repeated_placeholder.ts',
      lineNumber: 11,
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