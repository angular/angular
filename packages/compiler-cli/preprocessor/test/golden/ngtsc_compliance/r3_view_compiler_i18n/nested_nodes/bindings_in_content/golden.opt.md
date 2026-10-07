# /out/bindings_in_content.ngtypecheck.ts
```ts
/**
 * TCB for /bindings_in_content.ts
 * @generated
 */

import * as i0 from './bindings_in_content';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.one /*258,261*/ /*258,261*/;
    '' + _pipe1.transform(/*307,316*/ this.two /*301,304*/ /*301,304*/) /*301,316*/;
    '' +
      (this.three /*356,361*/ /*356,361*/ +
        this.four /*364,368*/ /*364,368*/ /*356,368*/ +
        this.five /*371,375*/ /*371,375*/) /*356,375*/;
  }
}

```

# /out/bindings_in_content.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class UppercasePipe {
  transform(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UppercasePipe, never> = function UppercasePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UppercasePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<UppercasePipe, 'uppercase', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'uppercase',
      type: UppercasePipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UppercasePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'uppercase',
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
  one = 1;
  two = 2;
  three = 3;
  four = 4;
  five = 5;
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
    decls: 7,
    vars: 5,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_572579892698764378$$_BINDINGS_IN_CONTENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'My i18n block #{$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ one }}' } },
          );
        i18n_0 = MSG_EXTERNAL_572579892698764378$$_BINDINGS_IN_CONTENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`My i18n block #${'�0�'}:INTERPOLATION:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_609623417156596326$$_BINDINGS_IN_CONTENT_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            'My i18n block #{$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ two | uppercase }}' } },
          );
        i18n_1 = MSG_EXTERNAL_609623417156596326$$_BINDINGS_IN_CONTENT_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`My i18n block #${'�0�'}:INTERPOLATION:`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3998119318957372120$$_BINDINGS_IN_CONTENT_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            'My i18n block #{$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ three + four + five }}' } },
          );
        i18n_2 = MSG_EXTERNAL_3998119318957372120$$_BINDINGS_IN_CONTENT_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`My i18n block #${'�0�'}:INTERPOLATION:`;
      }
      return [i18n_0, i18n_1, i18n_2];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'div');
        i0.ɵɵi18n(3, 1);
        i0.ɵɵpipe(4, 'uppercase');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(5, 'div');
        i0.ɵɵi18n(6, 2);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.one);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(4, 3, ctx.two));
        i0.ɵɵi18nApply(3);
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.three + ctx.four + ctx.five);
        i0.ɵɵi18nApply(6);
      }
    },
    dependencies: [UppercasePipe],
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
      <div i18n>My i18n block #{{ one }}</div>
      <div i18n>My i18n block #{{ two | uppercase }}</div>
      <div i18n>My i18n block #{{ three + four + five }}</div>
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
      filePath: 'bindings_in_content.ts',
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyComponent, typeof UppercasePipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, UppercasePipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, UppercasePipe] });
})();

```