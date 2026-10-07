# /out/a/a.component.ngtypecheck.ts
```ts
/**
 * TCB for /a/a.component.ts
 * @generated
 */

import * as i0 from './a.component';

/*tcb1*/
function _tcb1(this: i0.A) {
  if (true) {
  }
}

```

# /out/a/a.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from '../shared/b.component';

export class A {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<A, never> = function A_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || A)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<A, 'a-cmp', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: A,
      selectors: [['a-cmp']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function A_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'b-cmp');
        }
      },
      dependencies: [i1.B],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        A,
        [
          {
            type: Component,
            args: [
              {
                selector: 'a-cmp',
                template: '<b-cmp></b-cmp>',
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
    i0.ɵsetClassDebugInfo(A, { className: 'A', filePath: 'a/a.component.ts', lineNumber: 8 });
})();

```

# /out/a/a.module.ts
```ts
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { A } from './a.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class AModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never> = function AModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, [typeof A], [typeof SharedModule], never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [A],
                imports: [SharedModule],
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
    i0.ɵɵsetNgModuleScope(AModule, { declarations: [A], imports: [SharedModule] });
})();

```

# /out/shared/b.component.ngtypecheck.ts
```ts
/**
 * TCB for /shared/b.component.ts
 * @generated
 */

import * as i0 from './b.component';

/*tcb1*/
function _tcb1(this: i0.B) {
  if (true) {
  }
}

```

# /out/shared/b.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class B {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<B, never> = function B_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || B)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<B, 'b-cmp', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: B,
      selectors: [['b-cmp']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function B_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵtext(0, 'b');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        B,
        [
          {
            type: Component,
            args: [
              {
                selector: 'b-cmp',
                template: 'b',
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
    i0.ɵsetClassDebugInfo(B, { className: 'B', filePath: 'shared/b.component.ts', lineNumber: 8 });
})();

```

# /out/shared/shared.module.ts
```ts
import { NgModule } from '@angular/core';
import { B } from './b.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class SharedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never> = function SharedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, [typeof B], never, [typeof B]> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [B],
                exports: [B],
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
    i0.ɵɵsetNgModuleScope(SharedModule, { declarations: [B], exports: [B] });
})();

```