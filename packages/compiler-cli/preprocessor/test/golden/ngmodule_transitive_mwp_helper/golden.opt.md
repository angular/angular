# /out/app.ts
```ts
import { NgModule } from '@angular/core';
import { MiddleComp } from './middle';
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof MiddleComp], never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [MiddleComp] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [MiddleComp],
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
    i0.ɵɵsetNgModuleScope(AppModule, { imports: [MiddleComp] });
})();

```

# /out/feature.ts
```ts
import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FeatureService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FeatureService, never> = function FeatureService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FeatureService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: FeatureService, factory: FeatureService.ɵfac });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(FeatureService, [{ type: Injectable }], null, null);
  }
}

export class FeatureModule {
  static forRoot(): ModuleWithProviders<FeatureModule> {
    return { ngModule: FeatureModule, providers: [FeatureService] };
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FeatureModule, never> = function FeatureModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FeatureModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<FeatureModule, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FeatureModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FeatureModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(FeatureModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export function provideFeature(): ModuleWithProviders<FeatureModule> {
  return FeatureModule.forRoot();
}

```

# /out/middle.ngtypecheck.ts
```ts
/**
 * TCB for /middle.ts
 * @generated
 */

import * as i0 from './middle';

/*tcb1*/
function _tcb1(this: i0.MiddleComp) {
  if (true) {
  }
}

```

# /out/middle.ts
```ts
import { Component, NgModule } from '@angular/core';
import { provideFeature } from './feature';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './feature';

export class MiddleModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MiddleModule, never> = function MiddleModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MiddleModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MiddleModule, never, [typeof i1.FeatureModule], never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MiddleModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MiddleModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [provideFeature()] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MiddleModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [provideFeature()],
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
    i0.ɵɵsetNgModuleScope(MiddleModule, { imports: [i1.FeatureModule] });
})();

export class MiddleComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MiddleComp, never> = function MiddleComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MiddleComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MiddleComp,
    'middle-comp',
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
      type: MiddleComp,
      selectors: [['middle-comp']],
      decls: 0,
      vars: 0,
      template: function MiddleComp_Template(rf: number, ctx: any): any {},
      dependencies: [MiddleModule],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MiddleComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'middle-comp',
                template: '',
                imports: [MiddleModule],
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
    i0.ɵsetClassDebugInfo(MiddleComp, {
      className: 'MiddleComp',
      filePath: 'middle.ts',
      lineNumber: 14,
    });
})();

```