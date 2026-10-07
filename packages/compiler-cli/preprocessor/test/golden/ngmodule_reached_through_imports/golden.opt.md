# /out/c1.component.ngtypecheck.ts
```ts
/**
 * TCB for /c1.component.ts
 * @generated
 */

import * as i0 from './c1.component';

/*tcb1*/
function _tcb1(this: i0.C1) {
  if (true) {
  }
}

```

# /out/c1.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './d.directive';

export class C1 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C1, never> = function C1_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C1)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<C1, 'c1', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C1,
      selectors: [['c1']],
      standalone: false,
      decls: 1,
      vars: 0,
      consts: [['d', '']],
      template: function C1_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div', 0);
        }
      },
      dependencies: [i1.D],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C1,
        [
          {
            type: Component,
            args: [{ selector: 'c1', template: '<div d></div>', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C1, { className: 'C1', filePath: 'c1.component.ts', lineNumber: 4 });
})();

```

# /out/c2.component.ngtypecheck.ts
```ts
/**
 * TCB for /c2.component.ts
 * @generated
 */

import * as i0 from './c2.component';

/*tcb1*/
function _tcb1(this: i0.C2) {
  if (true) {
  }
}

```

# /out/c2.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './d.directive';

export class C2 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C2, never> = function C2_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C2)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<C2, 'c2', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C2,
      selectors: [['c2']],
      standalone: false,
      decls: 1,
      vars: 0,
      consts: [['d', '']],
      template: function C2_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'span', 0);
        }
      },
      dependencies: [i1.D],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C2,
        [
          {
            type: Component,
            args: [{ selector: 'c2', template: '<span d></span>', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C2, { className: 'C2', filePath: 'c2.component.ts', lineNumber: 4 });
})();

```

# /out/d.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class D {
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

# /out/m.module.ts
```ts
import { NgModule } from '@angular/core';
import { C1 } from './c1.component';
import { C2 } from './c2.component';
import { D } from './d.directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class MModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MModule, never> = function MModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MModule, [typeof C1, typeof C2, typeof D], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MModule,
        [{ type: NgModule, args: [{ declarations: [C1, C2, D] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MModule, { declarations: [C1, C2, D] });
})();

```