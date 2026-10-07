# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { MyType } from './types';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  constructor(private myType: MyType) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || AppComponent)(i0.ɵɵdirectiveInject(MyType));
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 2,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: '<div>Hello</div>',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [
          {
            /* @ts-ignore */
            type: MyType,
          },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 9,
    });
})();

```

# /out/service.ts
```ts
import { Injectable, Inject } from '@angular/core';
import { LoggerConfig, LogFormat, Logger } from './config';
// @ts-ignore
import * as i0 from '@angular/core';

// Local interface — type-only, no runtime value
interface LocalConfig {
  debug: boolean;
}

const LOGGER_CONFIG = 'LOGGER_CONFIG';

// Service with all type-only params → deps: 'invalid'
export class InvalidDepsService {
  constructor(private config: LoggerConfig) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InvalidDepsService, never> =
    function InvalidDepsService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || InvalidDepsService)(i0.ɵɵinject(LoggerConfig));
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: InvalidDepsService,
    factory: InvalidDepsService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InvalidDepsService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          {
            /* @ts-ignore */
            type: LoggerConfig,
          },
        ],
        null,
      );
  }
}

// Service with @Inject override on type-only param → deps: valid
export class InjectOverrideService {
  constructor(private config: LoggerConfig) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InjectOverrideService, never> =
    function InjectOverrideService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || InjectOverrideService)(i0.ɵɵinject(LOGGER_CONFIG));
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: InjectOverrideService,
    factory: InjectOverrideService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InjectOverrideService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [{ type: undefined, decorators: [{ type: Inject, args: [LOGGER_CONFIG] }] }],
        null,
      );
  }
}

// Service with class param → deps: valid
export class ValidDepsService {
  constructor(private logger: Logger) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ValidDepsService, never> = function ValidDepsService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ValidDepsService)(i0.ɵɵinject(Logger));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ValidDepsService,
    factory: ValidDepsService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ValidDepsService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          {
            /* @ts-ignore */
            type: Logger,
          },
        ],
        null,
      );
  }
}

// Service with local interface param → deps: 'invalid'
export class LocalInterfaceService {
  constructor(private config: LocalConfig) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalInterfaceService, never> =
    function LocalInterfaceService_Factory(__ngFactoryType__: any): any {
      i0.ɵɵinvalidFactory();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: LocalInterfaceService,
    factory: LocalInterfaceService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalInterfaceService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [{ type: undefined }],
        null,
      );
  }
}

// Service with mixed params (one type-only) → deps: 'invalid'
export class MixedDepsService {
  constructor(
    private logger: Logger,
    private format: LogFormat,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MixedDepsService, never> = function MixedDepsService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MixedDepsService)(i0.ɵɵinject(Logger), i0.ɵɵinject(LogFormat));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MixedDepsService,
    factory: MixedDepsService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MixedDepsService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          {
            /* @ts-ignore */
            type: Logger,
          },
          {
            /* @ts-ignore */
            type: LogFormat,
          },
        ],
        null,
      );
  }
}

```