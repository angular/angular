# /out/interpolation_complex_expressions.ngtypecheck.ts
```ts
/**
 * TCB for /interpolation_complex_expressions.ts
 * @generated
 */

import * as i0 from './interpolation_complex_expressions';

var _pipe1 = null! as i0.AsyncPipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' +
      _pipe1.transform(/*245,250*/ this.valueA /*236,242*/ /*236,242*/) /*236,250*/ +
      this.valueA /*257,263*/ /*257,263*/?.a /*265,266*/ /*257,266*/?.b /*268,269*/ /*257,269*/ +
      this.valueA /*276,282*/ /*276,282*/
        .getRawValue /*283,294*/
        () /*276,296*/
        ?.getTitle /*298,306*/ /*276,306*/
        ?.() /*276,308*/;
  }
}

```

# /out/interpolation_complex_expressions.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AsyncPipe {
  transform(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AsyncPipe, never> = function AsyncPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AsyncPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<AsyncPipe, 'async', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'async',
    type: AsyncPipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AsyncPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'async',
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
    decls: 3,
    vars: 5,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6886266366118454233$$_INTERPOLATION_COMPLEX_EXPRESSIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' {$interpolation} {$interpolation_1} {$interpolation_2} ',
            { 'interpolation': '�0�', 'interpolation_1': '�1�', 'interpolation_2': '�2�' },
            {
              original_code: {
                'interpolation': '{{ valueA | async }}',
                'interpolation_1': '{{ valueA?.a?.b }}',
                'interpolation_2': '{{ valueA.getRawValue()?.getTitle() }}',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_6886266366118454233$$_INTERPOLATION_COMPLEX_EXPRESSIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` ${'�0�'}:INTERPOLATION: ${'�1�'}:INTERPOLATION_1: ${'�2�'}:INTERPOLATION_2: `;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵpipe(2, 'async');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 3, ctx.valueA))(ctx.valueA?.a?.b)(
          ctx.valueA.getRawValue()?.getTitle(),
        );
        i0.ɵɵi18nApply(1);
      }
    },
    dependencies: [AsyncPipe],
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
        {{ valueA | async }}
        {{ valueA?.a?.b }}
        {{ valueA.getRawValue()?.getTitle() }}
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
      filePath: 'interpolation_complex_expressions.ts',
      lineNumber: 22,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyComponent, typeof AsyncPipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, AsyncPipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, AsyncPipe] });
})();

```