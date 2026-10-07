# /out/c.component.ngtypecheck.ts
```ts
/**
 * TCB for /c.component.ts
 * @generated
 */

import * as i0 from './c.component';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/c.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const LABEL = 'c';

export class C {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C, never> = function C_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || C)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<C, 'c', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C,
      selectors: [['c']],
      standalone: false,
      decls: 1,
      vars: 0,
      consts: [['d', '']],
      template: function C_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div', 0);
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [
          {
            type: Component,
            args: [{ selector: 'c', template: '<div d></div>', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'c.component.ts', lineNumber: 6 });
})();

```

# /out/d.directive.ts
```ts
import { Directive } from '@angular/core';
import { LABEL } from './c.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class D {
  l = LABEL;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<D, never> = function D_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || D)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<D, '[d]', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: D, selectors: [['', 'd', '']], standalone: false });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        D,
        [{ type: Directive, args: [{ selector: '[d]', standalone: false }] }],
        null,
        null,
      );
  }
}

```

# /out/m1.module.ts
```ts
import { NgModule } from '@angular/core';
import { C } from './c.component';
import { D } from './d.directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class M1Module {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M1Module, never> = function M1Module_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || M1Module)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M1Module, [typeof C, typeof D], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M1Module });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M1Module> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        M1Module,
        [{ type: NgModule, args: [{ declarations: [C, D] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M1Module, { declarations: [C, D] });
})();

```

# /out/m2.module.ts
```ts
import { NgModule } from '@angular/core';
import { C } from './c.component';
import { D } from './d.directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class M2Module {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M2Module, never> = function M2Module_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || M2Module)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M2Module, [typeof C, typeof D], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M2Module });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M2Module> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        M2Module,
        [{ type: NgModule, args: [{ declarations: [C, D] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M2Module, { declarations: [C, D] });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/c.component.ts",
      "category": "error",
      "code": 6007,
      "messageText": "The Component 'C' is declared by more than one NgModule.",
      "span": {
        "start": 156,
        "end": 157
      }
    },
    {
      "filePath": "/d.directive.ts",
      "category": "error",
      "code": 6007,
      "messageText": "The Directive 'D' is declared by more than one NgModule.",
      "span": {
        "start": 141,
        "end": 142
      }
    }
  ]
}

```