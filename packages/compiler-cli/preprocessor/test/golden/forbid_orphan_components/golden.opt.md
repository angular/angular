# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.DeclaredCmp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.StandaloneCmp) {
  if (true) {
  }
}

```

# /out/test.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DeclaredCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeclaredCmp, never> = function DeclaredCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DeclaredCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DeclaredCmp,
    'declared-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DeclaredCmp,
    selectors: [['declared-cmp']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function DeclaredCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, '...');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeclaredCmp,
        [
          {
            type: Component,
            args: [{ selector: 'declared-cmp', template: '...', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(DeclaredCmp, {
      className: 'DeclaredCmp',
      filePath: 'test.ts',
      lineNumber: 4,
      forbidOrphanRendering: true,
    });
})();

export class DeclaringModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeclaringModule, never> = function DeclaringModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DeclaringModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<DeclaringModule, [typeof DeclaredCmp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DeclaringModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DeclaringModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeclaringModule,
        [{ type: NgModule, args: [{ declarations: [DeclaredCmp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(DeclaringModule, { declarations: [DeclaredCmp] });
})();

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
    decls: 1,
    vars: 0,
    template: function StandaloneCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, '...');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneCmp,
        [{ type: Component, args: [{ selector: 'standalone-cmp', template: '...' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(StandaloneCmp, {
      className: 'StandaloneCmp',
      filePath: 'test.ts',
      lineNumber: 10,
      forbidOrphanRendering: true,
    });
})();

```