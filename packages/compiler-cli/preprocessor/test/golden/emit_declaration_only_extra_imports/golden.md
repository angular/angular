# /out/child.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ChildComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildComp, never> = function ChildComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ChildComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChildComp,
    'child-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: ChildComp,
      selectors: [['child-comp']],
      standalone: false,
      decls: 0,
      vars: 0,
      template: function ChildComp_Template(rf: number, ctx: any): any {},
      dependencies: i0.ɵɵgetComponentDepsFactory(ChildComp),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'child-comp',
                template: '',
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
    i0.ɵsetClassDebugInfo(ChildComp, {
      className: 'ChildComp',
      filePath: 'child.ts',
      lineNumber: 8,
    });
})();

```

# /out/comp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComp {
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
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: MyComp,
      selectors: [['my-comp']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function MyComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'child-comp');
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(MyComp),
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
                template: '<child-comp></child-comp>',
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
    i0.ɵsetClassDebugInfo(MyComp, { className: 'MyComp', filePath: 'comp.ts', lineNumber: 8 });
})();

```

# /out/module.ts
```ts
import { NgModule } from '@angular/core';
import { ChildComp } from './child';
import { MyComp } from './comp';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```