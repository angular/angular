# /out/app.module.ts
```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MyComp } from './my-comp.component';
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
  static ɵmod: AppModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MyComp],
                schemas: [CUSTOM_ELEMENTS_SCHEMA],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [MyComp] });
})();

```

# /out/my-comp.component.ts
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
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [['my-comp']],
    standalone: false,
    decls: 2,
    vars: 1,
    consts: [[3, 'unknown-property']],
    template: function MyComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('unknown-property', true);
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
                template: `
        <unknown-element></unknown-element>
        <div [unknown-property]="true"></div>
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
    i0.ɵsetClassDebugInfo(MyComp, {
      className: 'MyComp',
      filePath: 'my-comp.component.ts',
      lineNumber: 11,
    });
})();

```