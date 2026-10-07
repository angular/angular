# /out/safe_call_use_null.ngtypecheck.ts
```ts
/**
 * TCB for /safe_call_use_null.ts
 * @generated
 */

import * as i0 from './safe_call_use_null';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    'Your last name is ' /*100,120*/ +
      (this.person /*124,130*/ /*124,130*/
        .getLastName /*131,142*/ /*124,142*/
        ?.() /*124,146*/ ?? 'unknown' /*150,159*/) /*124,159*/; /*100,160*/
    '' +
      this.person /*173,179*/ /*173,179*/
        .getName /*180,187*/ /*173,187*/
        ?.() /*173,191*/ +
      (this.person /*217,223*/ /*217,223*/
        .getSpecies /*224,234*/ /*217,234*/
        ?.() /*217,238*/?.() /*217,242*/?.() /*217,246*/?.() /*217,250*/?.() /*217,254*/ ||
        'unknown' /*258,267*/) /*217,267*/;
  }
}

```

# /out/safe_call_use_null.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  person: {
    getName: () => string;
    getLastName?: () => string;
    getSpecies?: () => () => () => () => () => string;
  } = { getName: () => 'Bilbo' };
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 2,
    vars: 3,
    consts: [[3, 'title']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span', 0);
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵproperty(
          'title',
          'Your last name is ' +
            ((ctx.person.getLastName == null ? null : ctx.person.getLastName()) ?? 'unknown'),
        );
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate2(
          ' Hello, ',
          ctx.person.getName == null ? null : ctx.person.getName(),
          '! You are a Balrog: ',
          (ctx.person.getSpecies == null
            ? null
            : (tmp_1_0 = ctx.person.getSpecies()) == null
              ? null
              : (tmp_1_0 = tmp_1_0()) == null
                ? null
                : (tmp_1_0 = tmp_1_0()) == null
                  ? null
                  : (tmp_1_0 = tmp_1_0()) == null
                    ? null
                    : tmp_1_0()) || 'unknown',
          ' ',
        );
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <span [title]="'Your last name is ' + (person.getLastName?.() ?? 'unknown')">
          Hello, {{ person.getName?.() }}!
          You are a Balrog: {{ person.getSpecies?.()?.()?.()?.()?.() || 'unknown' }}
        </span>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'safe_call_use_null.ts',
      lineNumber: 12,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] });
})();

```