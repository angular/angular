# /out/barrel.ts
```ts
import { NgModule } from '@angular/core';
import { Dir } from './lib/index';
// @ts-ignore
import * as i0 from '@angular/core';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof Dir], [typeof Dir]> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        M,
        [{ type: NgModule, args: [{ imports: [Dir], exports: [Dir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M, { imports: [Dir], exports: [Dir] });
})();

```

# /out/host_directive.ngtypecheck.ts
```ts
/**
 * TCB for /host_directive.ts
 * @generated
 */

import * as i0 from './host_directive';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/host_directive.ts
```ts
import { Component } from '@angular/core';
import { Dir } from './lib/index';
// @ts-ignore
import * as i0 from '@angular/core';

export class C {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C, never> = function C_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || C)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C,
    'c',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof Dir; inputs: {}; outputs: {} }]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C,
      selectors: [['c']],
      features: [i0.ɵɵHostDirectivesFeature([Dir])],
      decls: 0,
      vars: 0,
      template: function C_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [{ type: Component, args: [{ selector: 'c', template: '', hostDirectives: [Dir] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'host_directive.ts', lineNumber: 5 });
})();

```

# /out/lib/dir.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Dir, never> = function Dir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Dir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<Dir, '[dir]', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: Dir, selectors: [['', 'dir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Dir, [{ type: Directive, args: [{ selector: '[dir]' }] }], null, null);
  }
}

```

# /out/type_param.ngtypecheck.ts
```ts
/**
 * TCB for /type_param.ts
 * @generated
 */

import * as i0 from './type_param';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/type_param.ts
```ts
import { Component, Input } from '@angular/core';
import type { Item } from 'typeonly-pkg';
// @ts-ignore
import * as i0 from '@angular/core';

export function map(v: Item | null): string[] {
  return [];
}

export class C {
  items: string[] = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C, never> = function C_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || C)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C,
    'c',
    never,
    { 'items': { 'alias': 'items'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C,
      selectors: [['c']],
      inputs: { items: [2, 'items', 'items', map] },
      decls: 0,
      vars: 0,
      template: function C_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  // @ts-ignore
  declare static ngAcceptInputType_items: Item | null;
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [{ type: Component, args: [{ selector: 'c', template: '' }] }],
        null,
        { items: [{ type: Input, args: [{ transform: map }] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'type_param.ts', lineNumber: 9 });
})();

```