# /out/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AModule, BModule, ADirective, SHARED } from './shared';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './shared';

// Type-only syntax is peeled off the *outermost* expression of a top-level element, which is as
// far as a span can reach: erasing it from a nested position would mean rewriting the text
// rather than selecting a subrange of it. Two shapes hit that limit, pinned here so that a
// future fix is visibly a fix.
//
// Optimized, verified against ngc 22.1.0-next.6:
//   ngc:  imports: [[AModule, BModule], SHARED]
//   ours: imports: [[AModule as any, BModule], SHARED]
// The spread's own assertion is peeled — the element *is* the spread argument — so only the
// nested one survives.
//
// Local re-prints each element from source, where the spread keeps its `...` and so keeps the
// assertion with it:
//   ours: imports: [[AModule as any, BModule], ...(SHARED as any), ADirective]
//
// Cosmetic rather than a broken emit: this compiler's output is itself TypeScript, so `tsc`
// erases the assertion downstream exactly as ngtsc's printer would have.
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
    [typeof AModule, typeof BModule, typeof i1.AModule, typeof i1.BModule, typeof ADirective],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[AModule as any, BModule], SHARED],
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
                imports: [[AModule as any, BModule], ...(SHARED as any), ADirective],
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
      imports: [AModule, BModule, i1.AModule, i1.BModule, ADirective],
    });
})();

```

# /out/shared.ts
```ts
import { NgModule, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ADirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ADirective, never> = function ADirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ADirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ADirective,
    '[a]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: ADirective, selectors: [['', 'a', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ADirective,
        [{ type: Directive, args: [{ selector: '[a]', standalone: true }] }],
        null,
        null,
      );
  }
}

export class AModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never> = function AModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(AModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}
export class BModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never> = function BModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<BModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<BModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(BModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export const SHARED = [AModule, BModule];

```