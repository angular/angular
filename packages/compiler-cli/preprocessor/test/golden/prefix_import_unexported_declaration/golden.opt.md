# /out/my/upstream/upstream-module.ts
```ts
import { Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class DirectiveA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never> = function DirectiveA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectiveA,
    '[dirA]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveA,
    selectors: [['', 'dirA', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveA,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirA]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class UpstreamModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UpstreamModule, never> = function UpstreamModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UpstreamModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    UpstreamModule,
    [typeof DirectiveA],
    never,
    [typeof DirectiveA]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: UpstreamModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<UpstreamModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UpstreamModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [DirectiveA],
                exports: [DirectiveA],
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
    i0.ɵɵsetNgModuleScope(UpstreamModule, { declarations: [DirectiveA], exports: [DirectiveA] });
})();

```