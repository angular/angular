# /out/component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class RecordComponent {
  constructor(public inputs: Record<string, unknown>) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RecordComponent, never> = function RecordComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    i0.ɵɵinvalidFactory();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    RecordComponent,
    'app-record',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: RecordComponent,
    selectors: [['app-record']],
    decls: 2,
    vars: 0,
    template: function RecordComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Record Component');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RecordComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-record',
                template: '<div>Record Component</div>',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [{ type: undefined }],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(RecordComponent, {
      className: 'RecordComponent',
      filePath: 'component.ts',
      lineNumber: 8,
    });
})();

```

# /out/service.ts
```ts
import { Injectable, Inject, InjectionToken } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const DATA_TOKEN = new InjectionToken<Record<string, unknown>>('DATA_TOKEN');

export interface RouteTemplate {
  path: string;
}

export class StaticDataProvider {
  constructor(
    public route: RouteTemplate,
    public inputs: Record<string, unknown> = {},
    public config?: Partial<StaticDataProvider>,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StaticDataProvider, never> =
    function StaticDataProvider_Factory(__ngFactoryType__: any): any {
      i0.ɵɵinvalidFactory();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: StaticDataProvider,
    factory: StaticDataProvider.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StaticDataProvider,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [{ type: undefined }, { type: undefined }, { type: undefined }],
        null,
      );
  }
}

export class InjectRecordService {
  constructor(public inputs: Record<string, unknown>) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InjectRecordService, never> =
    function InjectRecordService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || InjectRecordService)(i0.ɵɵinject(DATA_TOKEN));
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: InjectRecordService,
    factory: InjectRecordService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InjectRecordService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [{ type: undefined, decorators: [{ type: Inject, args: [DATA_TOKEN] }] }],
        null,
      );
  }
}

export class GlobalValueInjectService {
  constructor(
    public window: Window,
    public reader: FileReader,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GlobalValueInjectService, never> =
    function GlobalValueInjectService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || GlobalValueInjectService)(
        i0.ɵɵinject(Window),
        i0.ɵɵinject(FileReader),
      );
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: GlobalValueInjectService,
    factory: GlobalValueInjectService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GlobalValueInjectService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          {
            /* @ts-ignore */
            type: Window,
          },
          {
            /* @ts-ignore */
            type: FileReader,
          },
        ],
        null,
      );
  }
}

declare namespace Gtag {
  interface Gtag {}
}

export class AmbientNamespaceInjectService {
  constructor(public gtag: Gtag.Gtag) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AmbientNamespaceInjectService, never> =
    function AmbientNamespaceInjectService_Factory(__ngFactoryType__: any): any {
      i0.ɵɵinvalidFactory();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: AmbientNamespaceInjectService,
    factory: AmbientNamespaceInjectService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AmbientNamespaceInjectService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [{ type: undefined }],
        null,
      );
  }
}

```