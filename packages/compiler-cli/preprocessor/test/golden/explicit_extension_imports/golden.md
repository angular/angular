# /out/app.ts
```ts
import { Component, Injectable } from '@angular/core';
import { MyService } from './types.ts'; // Explicit extension
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './types.ts';

export class TestService {
  constructor(private myService: MyService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestService, never> = function TestService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || TestService)(i0.ɵɵinject(i1.MyService));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: TestService, factory: TestService.ɵfac });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestService,
        [{ type: Injectable }],
        (): any => [
          {
            /* @ts-ignore */
            type: i1.MyService,
          },
        ],
        null,
      );
  }
}

export class TestComponent {
  constructor(private myService: MyService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || TestComponent)(i0.ɵɵdirectiveInject(i1.MyService));
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'test-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TestComponent,
      selectors: [['test-component']],
      decls: 1,
      vars: 0,
      template: function TestComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-component',
                template: `<div></div>`,
              },
            ],
          },
        ],
        (): any => [
          {
            /* @ts-ignore */
            type: i1.MyService,
          },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'app.ts',
      lineNumber: 13,
    });
})();

```