# /out/a/task.ngtypecheck.ts
```ts
/**
 * TCB for /a/task.ts
 * @generated
 */

import * as i0 from './task';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TaskDetail) {
  if (true) {
  }
}

```

# /out/a/task.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TaskDetail {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TaskDetail, never> = function TaskDetail_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TaskDetail)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TaskDetail,
    'a-task',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TaskDetail,
      selectors: [['a-task']],
      decls: 0,
      vars: 0,
      template: function TaskDetail_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TaskDetail,
        [{ type: Component, args: [{ selector: 'a-task', template: '' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TaskDetail, {
      className: 'TaskDetail',
      filePath: 'a/task.ts',
      lineNumber: 4,
    });
})();

```

# /out/b/task.ngtypecheck.ts
```ts
/**
 * TCB for /b/task.ts
 * @generated
 */

import * as i0 from './task';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TaskDetail) {
  if (true) {
  }
}

```

# /out/b/task.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TaskDetail {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TaskDetail, never> = function TaskDetail_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TaskDetail)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TaskDetail,
    'b-task',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TaskDetail,
      selectors: [['b-task']],
      decls: 0,
      vars: 0,
      template: function TaskDetail_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TaskDetail,
        [{ type: Component, args: [{ selector: 'b-task', template: '' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TaskDetail, {
      className: 'TaskDetail',
      filePath: 'b/task.ts',
      lineNumber: 4,
    });
})();

```

# /out/barrel.ngtypecheck.ts
```ts
/**
 * TCB for /barrel.ts
 * @generated
 */

import * as i0 from './barrel';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/barrel.ts
```ts
import { Component } from '@angular/core';
import { Dir } from './lib/';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './lib/dir';

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
    [{ directive: typeof i1.Dir; inputs: {}; outputs: {} }]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C,
      selectors: [['c']],
      features: [i0.ɵɵHostDirectivesFeature([i1.Dir])],
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
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'barrel.ts', lineNumber: 5 });
})();

```

# /out/charts/dir.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AwesomechartsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AwesomechartsModule, never> =
    function AwesomechartsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AwesomechartsModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<AwesomechartsModule, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AwesomechartsModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AwesomechartsModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(AwesomechartsModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class Other {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Other, never> = function Other_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Other)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<Other, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Other });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Other> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Other, [{ type: NgModule, args: [{}] }], null, null);
  }
}

```

# /out/deprecated_alias.ts
```ts
import { Directive } from '@angular/core';
import { OldDir } from './deprecated';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './deprecated';

export class X {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<X, never> = function X_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || X)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    X,
    '[x]',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof i1.RealDir; inputs: {}; outputs: {} }]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: X,
      selectors: [['', 'x', '']],
      features: [i0.ɵɵHostDirectivesFeature([i1.RealDir])],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        X,
        [{ type: Directive, args: [{ selector: '[x]', hostDirectives: [OldDir] }] }],
        null,
        null,
      );
  }
}

```

# /out/deprecated.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class RealDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RealDir, never> = function RealDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RealDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    RealDir,
    '[real]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: RealDir, selectors: [['', 'real', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RealDir,
        [{ type: Directive, args: [{ selector: '[real]' }] }],
        null,
        null,
      );
  }
}

export { RealDir as OldDir };

```

# /out/for_root.ts
```ts
import { NgModule } from '@angular/core';
import { RootModule } from './lib';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './lib/root';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof i1.RootModule], never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [RootModule.forRoot()] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        M,
        [{ type: NgModule, args: [{ imports: [RootModule.forRoot()] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M, { imports: [i1.RootModule] });
})();

```

# /out/imported_transform_local_type.ngtypecheck.ts
```ts
/**
 * TCB for /imported_transform_local_type.ts
 * @generated
 */

import * as i0 from './imported_transform_local_type';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/imported_transform_local_type.ts
```ts
import { Component, Input } from '@angular/core';
import { toNum } from './local_util';
// @ts-ignore
import * as i0 from '@angular/core';

export interface Foo {
  f: number;
}

export class C {
  n = 0;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C, never> = function C_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || C)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C,
    'c',
    never,
    { 'n': { 'alias': 'n'; 'required': false } },
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
      inputs: { n: [2, 'n', 'n', toNum] },
      decls: 0,
      vars: 0,
      template: function C_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  // @ts-ignore
  declare static ngAcceptInputType_n: Foo | string;
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [{ type: Component, args: [{ selector: 'c', template: '' }] }],
        null,
        { n: [{ type: Input, args: [{ transform: toNum }] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, {
      className: 'C',
      filePath: 'imported_transform_local_type.ts',
      lineNumber: 9,
    });
})();

```

# /out/imported_transform.ngtypecheck.ts
```ts
/**
 * TCB for /imported_transform.ts
 * @generated
 */

import * as i0 from './imported_transform';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/imported_transform.ts
```ts
import { Component, Input } from '@angular/core';
import { toNum } from './util';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './foo';

export class C {
  n = 0;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C, never> = function C_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || C)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C,
    'c',
    never,
    { 'n': { 'alias': 'n'; 'required': false } },
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
      inputs: { n: [2, 'n', 'n', toNum] },
      decls: 0,
      vars: 0,
      template: function C_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  // @ts-ignore
  declare static ngAcceptInputType_n: i1.Foo | string;
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [{ type: Component, args: [{ selector: 'c', template: '' }] }],
        null,
        { n: [{ type: Input, args: [{ transform: toNum }] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'imported_transform.ts', lineNumber: 5 });
})();

```

# /out/inferred_type.ts
```ts
import { NgModule } from '@angular/core';
import { Dir, mk } from './lib/dir';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './lib/dir';

export class M {
  thing = mk();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof i1.Dir], never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(M, [{ type: NgModule, args: [{ imports: [Dir] }] }], null, null);
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) && i0.ɵɵsetNgModuleScope(M, { imports: [Dir] });
})();

```

# /out/lib/dir.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export interface Thing {
  a: number;
}

export function mk(): Thing {
  return { a: 1 };
}

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

# /out/lib/root.ts
```ts
import { ModuleWithProviders, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class RootModule {
  static forRoot(): ModuleWithProviders<RootModule> {
    return { ngModule: RootModule };
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RootModule, never> = function RootModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RootModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<RootModule, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: RootModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<RootModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(RootModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

```

# /out/namespace_param.ngtypecheck.ts
```ts
/**
 * TCB for /namespace_param.ts
 * @generated
 */

import * as i0 from './namespace_param';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/namespace_param.ts
```ts
import { Component, Input } from '@angular/core';
import * as api from './api';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './api';

export interface Mapped {
  id: string;
}

export function map(v: api.Item[]): Mapped[] {
  return v;
}

export class C {
  items: Mapped[] = [];
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
  declare static ngAcceptInputType_items: i1.Item[];
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
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'namespace_param.ts', lineNumber: 13 });
})();

```

# /out/ngmodule_barrel.ts
```ts
import { NgModule } from '@angular/core';
import { Dir } from './lib/index';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './lib/dir';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof i1.Dir], [typeof i1.Dir]> =
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

# /out/package_alias.ngtypecheck.ts
```ts
/**
 * TCB for /package_alias.ts
 * @generated
 */

import * as i0 from './package_alias';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/package_alias.ts
```ts
import { Component, NgModule } from '@angular/core';
import { OldDir } from 'mylib';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from 'mylib';

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
    [{ directive: typeof i1.RealDir; inputs: {}; outputs: {} }]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C,
      selectors: [['c']],
      features: [i0.ɵɵHostDirectivesFeature([i1.RealDir])],
      decls: 0,
      vars: 0,
      template: function C_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [{ type: Component, args: [{ selector: 'c', template: '', hostDirectives: [OldDir] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'package_alias.ts', lineNumber: 5 });
})();

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof i1.RealDir], never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(M, [{ type: NgModule, args: [{ imports: [OldDir] }] }], null, null);
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M, { imports: [OldDir] });
})();

```

# /out/paths_alias.ts
```ts
import { NgModule } from '@angular/core';
import { AwesomechartsModule as Ng2AwesomechartsModule } from 'charts-alias';
import { Other } from 'charts-dir';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from 'charts-alias';
// @ts-ignore
import * as i2 from 'charts-dir';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    M,
    never,
    [typeof i1.AwesomechartsModule, typeof i2.Other],
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [Ng2AwesomechartsModule, Other] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        M,
        [{ type: NgModule, args: [{ imports: [Ng2AwesomechartsModule, Other] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M, { imports: [Ng2AwesomechartsModule, Other] });
})();

```

# /out/same_name.ts
```ts
import { NgModule } from '@angular/core';
import { TaskDetail } from './a/task';
import { TaskDetail as TaskDetailOld } from './b/task';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './a/task';
// @ts-ignore
import * as i2 from './b/task';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    M,
    never,
    [typeof i1.TaskDetail, typeof i2.TaskDetail],
    never
  > =
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
        [{ type: NgModule, args: [{ imports: [TaskDetail, TaskDetailOld] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(M, { imports: [TaskDetail, TaskDetailOld] });
})();

```

# /out/sub/parent_barrel.ts
```ts
import { NgModule } from '@angular/core';
import { Dir } from '../lib';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from '../lib/dir';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof i1.Dir], [typeof i1.Dir]> =
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

# /out/type_only_import.ngtypecheck.ts
```ts
/**
 * TCB for /type_only_import.ts
 * @generated
 */

import * as i0 from './type_only_import';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/type_only_import.ts
```ts
import { Component, Input } from '@angular/core';
import type { Item } from './types/item';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './types/item';

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
  declare static ngAcceptInputType_items: i1.Item | null;
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
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'type_only_import.ts', lineNumber: 9 });
})();

```

# /out/type_only_reexport_alias.ngtypecheck.ts
```ts
/**
 * TCB for /type_only_reexport_alias.ts
 * @generated
 */

import * as i0 from './type_only_reexport_alias';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/type_only_reexport_alias.ts
```ts
import { Component, Input } from '@angular/core';
import { Item as It } from './types/typeonly';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './types/item';

export function map(v: It[]): string[] {
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
  declare static ngAcceptInputType_items: i1.Item[];
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
    i0.ɵsetClassDebugInfo(C, {
      className: 'C',
      filePath: 'type_only_reexport_alias.ts',
      lineNumber: 9,
    });
})();

```

# /out/type_only_reexport.ngtypecheck.ts
```ts
/**
 * TCB for /type_only_reexport.ts
 * @generated
 */

import * as i0 from './type_only_reexport';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.C) {
  if (true) {
  }
}

```

# /out/type_only_reexport.ts
```ts
import { Component, Input } from '@angular/core';
import { Item } from './types/typeonly';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './types/item';

export function map(v: Item[]): string[] {
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
  declare static ngAcceptInputType_items: i1.Item[];
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
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'type_only_reexport.ts', lineNumber: 9 });
})();

```