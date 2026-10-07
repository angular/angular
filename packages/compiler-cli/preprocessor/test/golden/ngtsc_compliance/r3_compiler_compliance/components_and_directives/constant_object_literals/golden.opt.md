# /out/constant_object_literals.ngtypecheck.ts
```ts
/**
 * TCB for /constant_object_literals.ts
 * @generated
 */

import * as i0 from './constant_object_literals';

/*tcb1*/
function _tcb1(this: i0.SomeComp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyApp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*244,294*/ = null! as i0.SomeComp; /*T:VAE*/
    _t1.prop /*256,260*/ = {} /*263,265*/ /*255,266*/;
    _t1.otherProp /*268,277*/ = {
      'a' /*281,282*/: 1 /*284,285*/,
      'b' /*287,288*/: 2 /*290,291*/,
    } /*280,292*/ /*267,293*/;
  }
}

```

# /out/constant_object_literals.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({});
const _c1 = (): any => ({ a: 1, b: 2 });

export class SomeComp {
  prop!: any;
  otherProp!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeComp, never> = function SomeComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SomeComp,
    'some-comp',
    never,
    {
      'prop': { 'alias': 'prop'; 'required': false };
      'otherProp': { 'alias': 'otherProp'; 'required': false };
    },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeComp,
    selectors: [['some-comp']],
    inputs: { prop: 'prop', otherProp: 'otherProp' },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function SomeComp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'some-comp',
                template: '',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { prop: [{ type: Input }], otherProp: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SomeComp, {
      className: 'SomeComp',
      filePath: 'constant_object_literals.ts',
      lineNumber: 7,
    });
})();

export class MyApp {
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
    decls: 1,
    vars: 4,
    consts: [[3, 'prop', 'otherProp']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'some-comp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('prop', i0.ɵɵpureFunction0(2, _c0))('otherProp', i0.ɵɵpureFunction0(3, _c1));
      }
    },
    dependencies: [SomeComp],
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
                template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>',
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
      filePath: 'constant_object_literals.ts',
      lineNumber: 16,
    });
})();

export class MyMod {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never> = function MyMod_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyMod)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof SomeComp, typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyMod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyMod,
        [{ type: NgModule, args: [{ declarations: [SomeComp, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [SomeComp, MyApp] });
})();

```