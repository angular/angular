# /out/src/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { CompA } from './comp-a.component';
import { CompB } from './comp-b.component';
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof CompA, typeof CompB],
    never,
    [typeof CompA, typeof CompB]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [CompA, CompB],
                exports: [CompA, CompB],
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
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [CompA, CompB], exports: [CompA, CompB] });
})();

```

# /out/src/comp-a.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/comp-a.component.ts
 * @generated
 */

import * as i0 from './comp-a.component';

/*tcb1*/
function _tcb1(this: i0.CompA) {
  if (true) {
  }
}

```

# /out/src/comp-a.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './comp-b.component';

const CompA_Defer_1_DepsFn = (): any => [i1.CompB];
function CompA_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'comp-b');
  }
}

export class CompA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompA, never> = function CompA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompA)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompA,
    'comp-a',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CompA,
    selectors: [['comp-a']],
    standalone: false,
    decls: 3,
    vars: 0,
    template: function CompA_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, CompA_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, CompA_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompA,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-a',
                template: '@defer { <comp-b></comp-b> }',
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CompA, {
      className: 'CompA',
      filePath: 'src/comp-a.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/src/comp-b.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/comp-b.component.ts
 * @generated
 */

import * as i0 from './comp-b.component';

/*tcb1*/
function _tcb1(this: i0.CompB) {
  if (true) {
  }
}

```

# /out/src/comp-b.component.ts
```ts
import { Component } from '@angular/core';
import { CompA } from './comp-a.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompB {
  compA: CompA | null = null;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompB, never> = function CompB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompB)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompB,
    'comp-b',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CompB,
    selectors: [['comp-b']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function CompB_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'CompB');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompB,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-b',
                template: '<div>CompB</div>',
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CompB, {
      className: 'CompB',
      filePath: 'src/comp-b.component.ts',
      lineNumber: 9,
    });
})();

```