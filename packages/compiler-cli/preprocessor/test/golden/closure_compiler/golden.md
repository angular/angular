# /out/index.ts
```ts
import { Component, Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = function (): any {
  return 'div[_ngcontent-%COMP%] { color: red; --%NS%long-prop: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }';
};

export class MyService {
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never> = function MyService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyService)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: MyService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyService, [{ type: Injectable }], null, null);
  }
}

export class MyApp {
  show = true;
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(
          1,
          'This is a very long template string designed to exceed the one hundred character threshold of the constant pool sharing mechanism in the Angular compiler when annotateForClosureCompiler is enabled.',
        );
        i0.ɵɵelementEnd();
      }
    },
    styles: [
      'div[_ngcontent-%COMP%] { color: red; --%NS%long-prop: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }',
    ],
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
                template:
                  '<div>This is a very long template string designed to exceed the one hundred character threshold of the constant pool sharing mechanism in the Angular compiler when annotateForClosureCompiler is enabled.</div>',
                styles: [
                  'div { color: red; --long-prop: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }',
                ],
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'index.ts', lineNumber: 12 });
})();

export class MyOtherApp {
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherApp, never> = function MyOtherApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyOtherApp)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyOtherApp,
    'my-other-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyOtherApp,
    selectors: [['my-other-app']],
    decls: 2,
    vars: 0,
    template: function MyOtherApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Short template');
        i0.ɵɵelementEnd();
      }
    },
    styles: [_c0()],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyOtherApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-other-app',
                template: '<div>Short template</div>',
                styles: [
                  'div { color: red; --long-prop: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }',
                ],
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
    i0.ɵsetClassDebugInfo(MyOtherApp, {
      className: 'MyOtherApp',
      filePath: 'index.ts',
      lineNumber: 21,
    });
})();

```