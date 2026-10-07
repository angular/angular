# /out/safe_call.ngtypecheck.ts
```ts
/**
 * TCB for /safe_call.ts
 * @generated
 */

import * as i0 from './safe_call';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    'Your last name is ' /*102,122*/ +
      (this.person /*126,132*/ /*126,132*/
        .getLastName /*133,144*/ /*126,144*/
        ?.() /*126,148*/ ?? 'unknown' /*152,161*/) /*126,161*/; /*102,162*/
    '' +
      this.person /*175,181*/ /*175,181*/
        .getName /*182,189*/ /*175,189*/
        ?.() /*175,193*/ +
      (this.person /*219,225*/ /*219,225*/
        .getSpecies /*226,236*/ /*219,236*/
        ?.() /*219,240*/?.() /*219,244*/?.() /*219,248*/?.() /*219,252*/?.() /*219,256*/ ||
        'unknown' /*260,269*/) /*219,269*/;
    'Your last name is ' /*380,400*/ +
      (this.person /*429,435*/ /*429,435*/
        .getLastName /*436,447*/ /*429,447*/
        ?.() /*429,451*/ /*404,452*/ ?? 'unknown' /*456,465*/) /*404,465*/; /*380,466*/
    '' +
      this.person /*504,510*/ /*504,510*/
        .getName /*511,518*/ /*504,518*/
        ?.() /*504,522*/ /*479,523*/ +
      (this.person /*574,580*/ /*574,580*/
        .getSpecies /*581,591*/ /*574,591*/
        ?.() /*574,595*/?.() /*574,599*/?.() /*574,603*/?.() /*574,607*/?.() /*574,611*/ /*549,612*/ ||
        'unknown' /*616,625*/) /*549,625*/;
  }
}

```

# /out/safe_call.ts
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
    decls: 4,
    vars: 6,
    consts: [[3, 'title']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span', 0);
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'span', 0);
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_3_0;
        i0.ɵɵproperty('title', 'Your last name is ' + (ctx.person.getLastName?.() ?? 'unknown'));
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate2(
          ' Hello, ',
          ctx.person.getName?.(),
          '! You are a Balrog: ',
          ctx.person.getSpecies?.()?.()?.()?.()?.() || 'unknown',
          ' ',
        );
        i0.ɵɵadvance();
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
            : (tmp_3_0 = ctx.person.getSpecies()) == null
              ? null
              : (tmp_3_0 = tmp_3_0()) == null
                ? null
                : (tmp_3_0 = tmp_3_0()) == null
                  ? null
                  : (tmp_3_0 = tmp_3_0()) == null
                    ? null
                    : tmp_3_0()) || 'unknown',
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

        <!-- using the magic $safeNavigationMigration keyword --> 
        <span [title]="'Your last name is ' + ($safeNavigationMigration(person.getLastName?.()) ?? 'unknown')">
          Hello, {{ $safeNavigationMigration(person.getName?.()) }}!
          You are a Balrog: {{ $safeNavigationMigration(person.getSpecies?.()?.()?.()?.()?.()) || 'unknown' }}
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'safe_call.ts', lineNumber: 18 });
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