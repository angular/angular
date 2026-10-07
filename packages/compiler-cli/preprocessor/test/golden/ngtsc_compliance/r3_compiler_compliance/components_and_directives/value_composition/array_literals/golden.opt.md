# /out/array_literals.ngtypecheck.ts
```ts
/**
 * TCB for /array_literals.ts
 * @generated
 */

import * as i0 from './array_literals';

/*tcb1*/
function _tcb1(this: i0.MyComp) {
  if (true) {
    '' + this.names /*123,128*/ /*123,128*/[0 /*129,130*/] /*123,131*/;
    '' + this.names /*149,154*/ /*149,154*/[1 /*155,156*/] /*149,157*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.MyApp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*304,345*/ = null! as i0.MyComp; /*T:VAE*/
    _t1.names /*314,319*/ = [
      'Nancy' /*323,330*/,
      this.customName /*332,342*/ /*332,342*/,
    ] /*322,343*/ /*313,344*/;
  }
}

```

# /out/array_literals.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => ['Nancy', a0];

export class MyComp {
  names!: string[];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never> = function MyComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComp,
    'my-comp',
    never,
    { 'names': { 'alias': 'names'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [['my-comp']],
    inputs: { names: 'names' },
    standalone: false,
    decls: 4,
    vars: 2,
    template: function MyComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'p');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'p');
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(ctx.names[0]);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(ctx.names[1]);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp',
                template: `
        <p>{{ names[0] }}</p>
        <p>{{ names[1] }}</p>
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        { names: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComp, {
      className: 'MyComp',
      filePath: 'array_literals.ts',
      lineNumber: 11,
    });
})();

export class MyApp {
  customName = 'Bess';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 3,
    consts: [[3, 'names']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'my-comp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('names', i0.ɵɵpureFunction1(1, _c0, ctx.customName));
      }
    },
    dependencies: [MyComp],
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
                selector: 'my-app',
                template: `
      <my-comp [names]="['Nancy', customName]"></my-comp>
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
      filePath: 'array_literals.ts',
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComp, typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComp, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComp, MyApp] });
})();

```