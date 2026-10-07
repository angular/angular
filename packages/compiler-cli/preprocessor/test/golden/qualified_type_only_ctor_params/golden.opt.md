# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.HybridComponent) {
  if (true) {
  }
}

```

# /out/test.ts
```ts
import { Injectable, Inject, Component, Attribute, OnInit } from '@angular/core';
import * as angular from 'angular';
import * as core from '@angular/core';
import * as tp from 'thirdparty';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalService {}

export class TestService {
  constructor(
    private readonly $q: angular.IQService,
    private readonly rawQ: angular.IQService,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestService, never> = function TestService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || TestService)(
      i0.ɵɵinject('$q'),
      i0.ɵɵinject(angular.IQService),
    );
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: TestService,
    factory: TestService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          { type: undefined, decorators: [{ type: Inject, args: ['$q'] }] },
          {
            /* @ts-ignore */
            type: angular.IQService,
          },
        ],
        null,
      );
  }
}

export class HybridComponent {
  constructor(
    private readonly attrName: string,
    private readonly attrCls: LocalService,
    private readonly readonlyMap: ReadonlyMap<string, any>,
    private readonly ngZone: core.NgZone,
    private readonly hook: core.OnInit,
    private readonly namedHook: OnInit,
    private readonly optionalLocal: LocalService | undefined,
    private readonly nullableLocal: LocalService | null,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HybridComponent, never> = function HybridComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    i0.ɵɵinvalidFactory();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HybridComponent,
    'app-hybrid',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HybridComponent,
    selectors: [['app-hybrid']],
    decls: 1,
    vars: 0,
    template: function HybridComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HybridComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-hybrid',
                template: '<div></div>',
              },
            ],
          },
        ],
        (): any => [
          { type: undefined, decorators: [{ type: Attribute, args: ['name'] }] },
          { type: LocalService, decorators: [{ type: Attribute, args: ['cls'] }] },
          { type: undefined },
          { type: core.NgZone },
          { type: undefined },
          { type: undefined },
          { type: undefined },
          { type: LocalService },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(HybridComponent, {
      className: 'HybridComponent',
      filePath: 'test.ts',
      lineNumber: 20,
    });
})();

// `tp.RealService` is a real class, but single-file analysis cannot see that through a package
// namespace import, so standard mode emits the metadata type under a `@ts-ignore`. Optimize mode
// reads the package's `.d.ts`, proves it is a value, and drops the guard.
export class ThirdPartyService {
  constructor(private readonly real: tp.RealService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ThirdPartyService, never> =
    function ThirdPartyService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || ThirdPartyService)(i0.ɵɵinject(tp.RealService));
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ThirdPartyService,
    factory: ThirdPartyService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ThirdPartyService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [{ type: tp.RealService }],
        null,
      );
  }
}

```