# /out/test.ts
```ts
import { Component, Directive, Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Service {}

export class TestDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestDirective, never> = function TestDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestDirective,
    '[appDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDirective,
    selectors: [['', 'appDir', '']],
    features: [i0.ɵɵProvidersFeature([Service])],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appDir]',
                standalone: true,
                providers: [Service],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class TestComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'app-test',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['app-test']],
    features: [i0.ɵɵProvidersFeature([Service], [Service])],
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
                selector: 'app-test',
                template: '<div></div>',
                standalone: true,
                providers: [Service],
                viewProviders: [Service],
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
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'test.ts',
      lineNumber: 19,
    });
})();

```