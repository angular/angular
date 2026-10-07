# /out/custom_factory.service.ts
```ts
import { Injectable, Optional } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dep {}

export function factory(dep: Dep) {
  return new CustomService(dep);
}

export class CustomService {
  constructor(public dep: Dep) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CustomService, never> = function CustomService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || CustomService)(i0.ɵɵinject(Dep));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: CustomService,
    factory: function CustomService_Factory(__ngFactoryType__: any): any {
      let __ngConditionalFactory__: any = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new __ngFactoryType__();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = factory(i0.ɵɵinject(Dep, 8), i0.ɵɵinject(Dep));
      }
      return __ngConditionalFactory__;
    },
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CustomService,
        [
          {
            type: Injectable,
            args: [
              {
                providedIn: 'root',
                useFactory: factory,
                deps: [
                  [new Optional(), Dep],
                  [new Host(), Dep],
                ],
              },
            ],
          },
        ],
        (): any => [{ type: Dep }],
        null,
      );
  }
}

```

# /out/data.service.ts
```ts
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
// @ts-ignore
import * as i0 from '@angular/core';

export class DataService {
  constructor(private logger: LoggerService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DataService, never> = function DataService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || DataService)(i0.ɵɵinject(LoggerService));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: DataService,
    factory: DataService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DataService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          {
            /* @ts-ignore */
            type: LoggerService,
          },
        ],
        null,
      );
  }
}

```

# /out/logger.service.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class LoggerService {
  log(msg: string) {
    console.log(msg);
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LoggerService, never> = function LoggerService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LoggerService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: LoggerService,
    factory: LoggerService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LoggerService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

```

# /out/url_handling_strategy.ts
```ts
import { Injectable, inject } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export abstract class UrlHandlingStrategy {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UrlHandlingStrategy, never> =
    function UrlHandlingStrategy_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || UrlHandlingStrategy)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: UrlHandlingStrategy,
    factory: (): any => (() => inject(DefaultUrlHandlingStrategy))(),
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UrlHandlingStrategy,
        [
          {
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => inject(DefaultUrlHandlingStrategy) }],
          },
        ],
        null,
        null,
      );
  }
}

export class DefaultUrlHandlingStrategy {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DefaultUrlHandlingStrategy, never> =
    function DefaultUrlHandlingStrategy_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DefaultUrlHandlingStrategy)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: DefaultUrlHandlingStrategy,
    factory: DefaultUrlHandlingStrategy.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DefaultUrlHandlingStrategy,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

```