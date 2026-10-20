# /out/a.ngtypecheck.ts
```ts
/**
 * TCB for /a.ts
 * @generated
 */

import * as i0 from './a';

/*tcb1*/
function _tcb1(this: i0.CompA) {
  if (true) {
  }
}

```

# /out/a.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './b';

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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
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
      dependencies: [i1.CompB],
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
    i0.ɵsetClassDebugInfo(CompA, { className: 'CompA', filePath: 'a.ts', lineNumber: 8 });
})();

```

# /out/b.ngtypecheck.ts
```ts
/**
 * TCB for /b.ts
 * @generated
 */

import * as i0 from './b';

/*tcb1*/
function _tcb1(this: i0.CompB) {
  if (true) {
  }
}

```

# /out/b.ts
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CompB,
      selectors: [['comp-b']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function CompB_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'comp-a');
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
                template: '<comp-a></comp-a>',
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
    i0.ɵsetClassDebugInfo(CompB, { className: 'CompB', filePath: 'b.ts', lineNumber: 8 });
})();

```

# /out/c.ngtypecheck.ts
```ts
/**
 * TCB for /c.ts
 * @generated
 */

import * as i0 from './c';

/*tcb1*/
function _tcb1(this: i0.CompC) {
  if (true) {
  }
}

```

# /out/c.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './d';

export class CompC {
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CompC,
      selectors: [['comp-c']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function CompC_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'comp-d');
        }
      },
      dependencies: [i1.CompD],
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
                template: '<comp-d></comp-d>',
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
    i0.ɵsetClassDebugInfo(CompC, { className: 'CompC', filePath: 'c.ts', lineNumber: 8 });
})();

```

# /out/d.ngtypecheck.ts
```ts
/**
 * TCB for /d.ts
 * @generated
 */

import * as i0 from './d';

/*tcb1*/
function _tcb1(this: i0.CompD) {
  if (true) {
  }
}

```

# /out/d.ts
```ts
import { Component } from '@angular/core';
import type { CompC } from './c';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompD {
  parent?: CompC;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompD, never> = function CompD_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompD)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompD,
    'comp-d',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CompD,
      selectors: [['comp-d']],
      standalone: false,
      decls: 2,
      vars: 0,
      template: function CompD_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div');
          i0.ɵɵtext(1, 'D');
          i0.ɵɵelementEnd();
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompD,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-d',
                template: '<div>D</div>',
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
    i0.ɵsetClassDebugInfo(CompD, { className: 'CompD', filePath: 'd.ts', lineNumber: 9 });
})();

```

# /out/module.ts
```ts
import { NgModule } from '@angular/core';
import { CompA } from './a';
import { CompB } from './b';
import { CompC } from './c';
import { CompD } from './d';
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
    [typeof CompA, typeof CompB, typeof CompC, typeof CompD],
    never,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [CompA, CompB, CompC, CompD],
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
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [CompA, CompB, CompC, CompD] });
})();
i0.ɵɵsetComponentScope(CompB, [CompA], []);

```