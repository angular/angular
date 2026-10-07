# /out/index.ts
```ts
import { Component, Injectable, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

declare function Custom(): ClassDecorator;

export class HybridService {
  /** @nocollapse */ static readonly $inject: readonly string[] = ['depA', 'depB'];
  /** Documented on a single line.
   * @nocollapse
   */
  static readonly documented = 1;
  /**
   * Documented over several lines.
   * @export
   * @nocollapse
   */
  static readonly multiLine = 2;
  /** @nocollapse */
  static readonly alreadyTagged = 3;
  static #secret = 4;
  instanceField = 5;

  static method(): number {
    return HybridService.#secret;
  }
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HybridService, never> = function HybridService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HybridService)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: HybridService,
    factory: HybridService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HybridService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

export class MyCmp {
  /** @nocollapse */ static readonly $inject = ['$scope'];
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCmp, never> = function MyCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyCmp)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyCmp,
    'my-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCmp,
    selectors: [['my-cmp']],
    decls: 0,
    vars: 0,
    template: function MyCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-cmp',
                template: '',
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
    i0.ɵsetClassDebugInfo(MyCmp, { className: 'MyCmp', filePath: 'index.ts', lineNumber: 29 });
})();

export class MyPipe implements PipeTransform {
  /** @nocollapse */ static readonly $inject = ['$filter'];
  transform(value: string): string {
    return value;
  }
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never> = function MyPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyPipe)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'myPipe',
    type: MyPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyPipe, [{ type: Pipe, args: [{ name: 'myPipe' }] }], null, null);
  }
}

// Still decorated after the Angular decorator is stripped: tsickle adds `@nocollapse` itself.
@Custom()
export class StillDecorated {
  static readonly $inject = ['depA'];
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StillDecorated, never> = function StillDecorated_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StillDecorated)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: StillDecorated,
    factory: StillDecorated.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(StillDecorated, [{ type: Injectable }], null, null);
  }
}

```