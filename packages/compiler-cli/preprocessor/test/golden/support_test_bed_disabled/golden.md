# /out/test.component.ts
```ts
import { Component, Injectable, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestService, never> = function TestService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: TestService,
    factory: TestService.ɵfac,
    providedIn: 'root',
  });
}

export class TestComponent {
  name = '';

  constructor(readonly service: TestService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || TestComponent)(i0.ɵɵdirectiveInject(TestService));
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'test-comp',
    never,
    { 'name': { 'alias': 'name'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['test-comp']],
    inputs: { name: 'name' },
    decls: 2,
    vars: 1,
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(ctx.name);
      }
    },
    encapsulation: 2,
  });
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'test.component.ts',
      lineNumber: 10,
    });
})();

```