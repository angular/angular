# /out/a.component.ngtypecheck.ts
```ts
/**
 * TCB for /a.component.ts
 * @generated
 */

import * as i0 from './a.component';

/*tcb1*/
function _tcb1(this: i0.CompA) {
  if (true) {
  }
}

```

# /out/a.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const CONST_A = 'data-from-a';

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
    decls: 1,
    vars: 0,
    template: function CompA_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'comp-b');
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
                template: '<comp-b></comp-b>',
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
      filePath: 'a.component.ts',
      lineNumber: 10,
    });
})();

```

# /out/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { CompA } from './a.component';
import { CompB } from './b.component';
import { CompC } from './c.component';
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
    [typeof CompA, typeof CompB, typeof CompC],
    never,
    [typeof CompA, typeof CompB, typeof CompC]
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
                declarations: [CompA, CompB, CompC],
                exports: [CompA, CompB, CompC],
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
      declarations: [CompA, CompB, CompC],
      exports: [CompA, CompB, CompC],
    });
})();
i0.ɵɵsetComponentScope(CompA, [CompB], []);
i0.ɵɵsetComponentScope(CompB, [CompC], []);
i0.ɵɵsetComponentScope(CompC, [], []);

```

# /out/b.component.ngtypecheck.ts
```ts
/**
 * TCB for /b.component.ts
 * @generated
 */

import * as i0 from './b.component';

/*tcb1*/
function _tcb1(this: i0.CompB) {
  if (true) {
  }
}

```

# /out/b.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompB {
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
    decls: 1,
    vars: 0,
    template: function CompB_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'comp-c');
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
                template: '<comp-c></comp-c>',
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
    i0.ɵsetClassDebugInfo(CompB, { className: 'CompB', filePath: 'b.component.ts', lineNumber: 8 });
})();

```

# /out/c.component.ngtypecheck.ts
```ts
/**
 * TCB for /c.component.ts
 * @generated
 */

import * as i0 from './c.component';

/*tcb1*/
function _tcb1(this: i0.CompC) {
  if (true) {
    '' + this.val /*137,140*/ /*137,140*/;
  }
}

```

# /out/c.component.ts
```ts
import { Component } from '@angular/core';
import { CONST_A } from './a.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompC {
  val = CONST_A;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompC, never> = function CompC_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompC)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompC,
    'comp-c',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CompC,
    selectors: [['comp-c']],
    standalone: false,
    decls: 2,
    vars: 1,
    template: function CompC_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(ctx.val);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompC,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-c',
                template: '<div>{{ val }}</div>',
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
    i0.ɵsetClassDebugInfo(CompC, { className: 'CompC', filePath: 'c.component.ts', lineNumber: 9 });
})();

```