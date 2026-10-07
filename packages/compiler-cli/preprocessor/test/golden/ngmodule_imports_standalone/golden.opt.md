# /out/app.module.ngtypecheck.ts
```ts
/**
 * TCB for /app.module.ts
 * @generated
 */

import * as i0 from './app.module';

/*tcb1*/
function _tcb1(this: i0.StandaloneComponent) {
  if (true) {
  }
}

```

# /out/app.module.ts
```ts
import { Component, Directive, Pipe, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class StandaloneComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneComponent, never> =
    function StandaloneComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || StandaloneComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StandaloneComponent,
    'standalone-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneComponent,
    selectors: [['standalone-comp']],
    decls: 1,
    vars: 0,
    template: function StandaloneComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Standalone');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'standalone-comp',
                template: 'Standalone',
                standalone: true,
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
    i0.ɵsetClassDebugInfo(StandaloneComponent, {
      className: 'StandaloneComponent',
      filePath: 'app.module.ts',
      lineNumber: 8,
    });
})();

export class StandaloneDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDirective, never> =
    function StandaloneDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || StandaloneDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    StandaloneDirective,
    '[standalone-dir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: StandaloneDirective,
    selectors: [['', 'standalone-dir', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[standalone-dir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class StandalonePipe {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandalonePipe, never> = function StandalonePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandalonePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<StandalonePipe, 'standalone-pipe', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'standalone-pipe', type: StandalonePipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandalonePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'standalone-pipe',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class OtherModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherModule, never> = function OtherModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OtherModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<OtherModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: OtherModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<OtherModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(OtherModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    never,
    [
      typeof StandaloneComponent,
      typeof StandaloneDirective,
      typeof StandalonePipe,
      typeof OtherModule,
    ],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [StandaloneComponent, StandaloneDirective, StandalonePipe, OtherModule],
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
    i0.ɵɵsetNgModuleScope(AppModule, {
      imports: [StandaloneComponent, StandaloneDirective, StandalonePipe, OtherModule],
    });
})();

```