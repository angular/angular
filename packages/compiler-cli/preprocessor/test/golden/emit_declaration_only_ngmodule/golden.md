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
}

```

# /out/default_imports.ts
```ts
import { NgModule } from '@angular/core';
import Dflt from './lib/dflt';
import { default as D2 } from './lib/dflt2';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './lib/dflt';
// @ts-ignore
import * as i2 from './lib/dflt2';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof i1.default, typeof i2.default], never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```

# /out/deprecated_alias.ts
```ts
import { Directive } from '@angular/core';
import { OldDir } from './deprecated';
// @ts-ignore
import * as i0 from '@angular/core';

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
    [{ directive: typeof OldDir; inputs: {}; outputs: {} }]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: X,
      selectors: [['', 'x', '']],
      features: [i0.ɵɵHostDirectivesFeature([OldDir])],
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

export const IMPORTED_INPUTS = ['x'];

```

# /out/for_root.ts
```ts
import { NgModule } from '@angular/core';
import { RootModule } from './lib';
import * as lib from './lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [ReturnType<typeof RootModule.forRoot>], never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

export class NsM {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NsM, never> = function NsM_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NsM)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    NsM,
    never,
    [ReturnType<typeof lib.RootModule.forRoot>],
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NsM });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NsM> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```

# /out/host_inputs.ts
```ts
import { Component, Directive, Input } from '@angular/core';
import { OldDir, IMPORTED_INPUTS } from './deprecated';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalDir {
  x: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalDir, never> = function LocalDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LocalDir,
    '[loc]',
    never,
    { 'x': { 'alias': 'x'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: LocalDir,
      selectors: [['', 'loc', '']],
      inputs: { x: 'x' },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(LocalDir, [{ type: Directive, args: [{ selector: '[loc]' }] }], null, {
        x: [{ type: Input }],
      });
  }
}

export class Cmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Cmp, never> = function Cmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Cmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Cmp,
    'c',
    never,
    {},
    {},
    never,
    never,
    true,
    [
      { directive: typeof OldDir; inputs: {}; outputs: {} },
      { directive: typeof LocalDir; inputs: {}; outputs: {} },
    ]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: Cmp,
      selectors: [['c']],
      features: [i0.ɵɵHostDirectivesFeature([OldDir, LocalDir])],
      decls: 0,
      vars: 0,
      template: function Cmp_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Cmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'c',
                template: '',
                hostDirectives: [OldDir, { directive: LocalDir, inputs: IMPORTED_INPUTS }],
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
    i0.ɵsetClassDebugInfo(Cmp, { className: 'Cmp', filePath: 'host_inputs.ts', lineNumber: 14 });
})();

```

# /out/lib/dflt.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export default class DfltModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DfltModule, never> = function DfltModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DfltModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<DfltModule, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DfltModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DfltModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```

# /out/lib/dflt2.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export default class Dflt2Module {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Dflt2Module, never> = function Dflt2Module_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Dflt2Module)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<Dflt2Module, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Dflt2Module });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Dflt2Module> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

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
}

```

# /out/namespace_transform.ts
```ts
import { Component, Input } from '@angular/core';
// @ts-ignore
import * as u from 'ext-lib';
// @ts-ignore
import * as i0 from '@angular/core';

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
      inputs: { n: [2, 'n', 'n', u.toNum] },
      decls: 0,
      vars: 0,
      template: function C_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  // @ts-ignore
  declare static ngAcceptInputType_n: Parameters<typeof u.toNum>[0];
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C,
        [{ type: Component, args: [{ selector: 'c', template: '' }] }],
        null,
        { n: [{ type: Input, args: [{ transform: u.toNum }] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C, { className: 'C', filePath: 'namespace_transform.ts', lineNumber: 6 });
})();

```

# /out/permissions_checker.ts
```ts
import { Component, EventEmitter, NgModule, Output, forwardRef } from '@angular/core';
import { AveLoggingModule } from '@external/ave-logging';
import { FooModule, provideFoo } from '@external/foo';
import { ForwardModule } from '@external/forward';
// @ts-ignore
import * as i0 from '@angular/core';

export interface PermissionsCheckerState {
  allowed: boolean;
}

export class PermissionsChecker {
  readonly stateChange = new EventEmitter<PermissionsCheckerState>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PermissionsChecker, never> =
    function PermissionsChecker_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PermissionsChecker)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    PermissionsChecker,
    'permissions-checker',
    never,
    {},
    { 'stateChange': 'stateChange' },
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: PermissionsChecker,
      selectors: [['permissions-checker']],
      outputs: { stateChange: 'stateChange' },
      standalone: false,
      decls: 2,
      vars: 0,
      template: function PermissionsChecker_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div');
          i0.ɵɵtext(1, 'Permissions');
          i0.ɵɵelementEnd();
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(PermissionsChecker),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PermissionsChecker,
        [
          {
            type: Component,
            args: [
              {
                selector: 'permissions-checker',
                template: '<div>Permissions</div>',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { stateChange: [{ type: Output }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(PermissionsChecker, {
      className: 'PermissionsChecker',
      filePath: 'permissions_checker.ts',
      lineNumber: 15,
    });
})();

export class LocalHelperModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalHelperModule, never> =
    function LocalHelperModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalHelperModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<LocalHelperModule, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LocalHelperModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LocalHelperModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

function getLocalImports() {
  return [LocalHelperModule];
}

const NG_MODULE_IMPORTS = [AveLoggingModule];

export class PermissionsCheckerModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PermissionsCheckerModule, never> =
    function PermissionsCheckerModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PermissionsCheckerModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    PermissionsCheckerModule,
    never,
    [
      [typeof AveLoggingModule],
      ReturnType<typeof FooModule.forRoot>,
      ReturnType<typeof provideFoo>,
      [typeof LocalHelperModule],
      typeof ForwardModule,
    ],
    [typeof PermissionsChecker]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: PermissionsCheckerModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<PermissionsCheckerModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```

# /out/same_name.ts
```ts
import { NgModule } from '@angular/core';
import { TaskDetail } from './a/task';
import { TaskDetail as TaskDetailOld } from './b/task';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './b/task';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    M,
    never,
    [typeof TaskDetail, typeof i1.TaskDetail],
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```

# /out/tuples.ts
```ts
import { NgModule } from '@angular/core';
import { Dir } from './lib/index';
import { SHARED } from './shared';
// @ts-ignore
import * as i0 from '@angular/core';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<M, never, [typeof SHARED, typeof Dir], [typeof SHARED]> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```

# /out/unresolved_host.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import { Grid as AliasGrid } from 'google3/some/grid/';
// @ts-ignore
import { Plain } from 'plain-lib';
// @ts-ignore
import * as i0 from '@angular/core';

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
    [
      { directive: typeof AliasGrid; inputs: {}; outputs: {} },
      { directive: typeof Plain; inputs: {}; outputs: {} },
    ]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: X,
      selectors: [['', 'x', '']],
      features: [i0.ɵɵHostDirectivesFeature([AliasGrid, Plain])],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        X,
        [{ type: Directive, args: [{ selector: '[x]', hostDirectives: [AliasGrid, Plain] }] }],
        null,
        null,
      );
  }
}

```

# /out/unresolved_ngmodule.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import { AwesomechartsModule as Ng2AwesomechartsModule } from 'ng2-awesomecharts';
// @ts-ignore
import { Plain } from 'plain-lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class M {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<M, never> = function M_Factory(__ngFactoryType__: any): any {
    return new (__ngFactoryType__ || M)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    M,
    never,
    [typeof Ng2AwesomechartsModule, typeof Plain],
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: M });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<M> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```