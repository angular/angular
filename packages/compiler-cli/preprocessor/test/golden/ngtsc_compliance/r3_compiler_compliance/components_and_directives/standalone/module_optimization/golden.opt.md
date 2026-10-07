# /out/module_optimization.ngtypecheck.ts
```ts
/**
 * TCB for /module_optimization.ts
 * @generated
 */

import * as i0 from './module_optimization';

/*tcb1*/
function _tcb1(this: i0.StandaloneCmp) {
  if (true) {
  }
}

```

# /out/module_optimization.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class StandaloneCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneCmp, never> = function StandaloneCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StandaloneCmp,
    'standalone-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneCmp,
    selectors: [['standalone-cmp']],
    decls: 0,
    vars: 0,
    template: function StandaloneCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'standalone-cmp',
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
    i0.ɵsetClassDebugInfo(StandaloneCmp, {
      className: 'StandaloneCmp',
      filePath: 'module_optimization.ts',
      lineNumber: 7,
    });
})();

export class StandaloneDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDir, never> = function StandaloneDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    StandaloneDir,
    never,
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: StandaloneDir });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(StandaloneDir, [{ type: Directive, args: [{}] }], null, null);
  }
}

export class Module {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Module, never> = function Module_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Module)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    Module,
    never,
    [typeof StandaloneCmp, typeof StandaloneDir],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Module });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Module> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Module,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [StandaloneCmp, StandaloneDir],
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
    i0.ɵɵsetNgModuleScope(Module, { imports: [StandaloneCmp, StandaloneDir] });
})();

```