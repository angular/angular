# /out/component.ts
```ts
import { Component } from '@angular/core';
import * as ns from './service';
// @ts-ignore
import * as i0 from '@angular/core';

export class ReproComponent {
  constructor(private readonly service: ns.MyService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ReproComponent, never> = function ReproComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ReproComponent)(i0.ɵɵdirectiveInject(ns.MyService));
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ReproComponent,
    'repro-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ReproComponent,
    selectors: [['repro-comp']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function ReproComponent_Template(rf: number, ctx: any): any {},
    dependencies: i0.ɵɵgetComponentDepsFactory(ReproComponent),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ReproComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'repro-comp',
                template: '',
                standalone: false,
              },
            ],
          },
        ],
        (): any => [
          {
            /* @ts-ignore */
            type: ns.MyService,
          },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ReproComponent, {
      className: 'ReproComponent',
      filePath: 'component.ts',
      lineNumber: 9,
    });
})();

```

# /out/service.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never> = function MyService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: MyService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

```