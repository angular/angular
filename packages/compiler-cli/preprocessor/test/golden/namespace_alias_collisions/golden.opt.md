# /out/collisions.ngtypecheck.ts
```ts
/**
 * TCB for /collisions.ts
 * @generated
 */

import * as i0 from './collisions';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.Cmp) {
  if (true) {
  }
}

```

# /out/collisions.ts
```ts
import { Component } from '@angular/core';
import { DirModule } from './dir';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './dir';

const i0 = 1;

export interface Incident {
  stage: string;
}

export class Cmp {
  v = i0;

  same(a: Incident[]) {
    return a.every((i1: Incident) => i1.stage === a[0].stage);
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Cmp, never> = function Cmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Cmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<Cmp, 'cmp', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: Cmp,
      selectors: [['cmp']],
      decls: 1,
      vars: 0,
      consts: [['dir', '']],
      template: function Cmp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div', 0);
        }
      },
      dependencies: [DirModule, i1.Dir],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Cmp,
        [
          {
            type: Component,
            args: [{ selector: 'cmp', template: '<div dir></div>', imports: [DirModule] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Cmp, { className: 'Cmp', filePath: 'collisions.ts', lineNumber: 11 });
})();

```

# /out/dir.ts
```ts
import { Directive, NgModule } from '@angular/core';
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
  static ɵdir: i0.ɵɵDirectiveDeclaration<Dir, '[dir]', never, {}, {}, never, never, false, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: Dir,
      selectors: [['', 'dir', '']],
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Dir,
        [{ type: Directive, args: [{ selector: '[dir]', standalone: false }] }],
        null,
        null,
      );
  }
}

export class DirModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirModule, never> = function DirModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<DirModule, [typeof Dir], never, [typeof Dir]> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DirModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DirModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirModule,
        [{ type: NgModule, args: [{ declarations: [Dir], exports: [Dir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(DirModule, { declarations: [Dir], exports: [Dir] });
})();

```

# /out/existing_imports.ngtypecheck.ts
```ts
/**
 * TCB for /existing_imports.ts
 * @generated
 */

import * as i0 from './existing_imports';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.Existing) {
  if (true) {
  }
}

```

# /out/existing_imports.ts
```ts
import { Component } from '@angular/core';
import * as i0 from '@angular/core';
import { DirModule } from './dir';
import * as i1 from './dir';

export class Existing {
  version = i0.VERSION;
  readonly dir = i1.Dir;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Existing, never> = function Existing_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Existing)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Existing,
    'existing',
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
      type: Existing,
      selectors: [['existing']],
      decls: 1,
      vars: 0,
      consts: [['dir', '']],
      template: function Existing_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div', 0);
        }
      },
      dependencies: [DirModule, i1.Dir],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Existing,
        [
          {
            type: Component,
            args: [{ selector: 'existing', template: '<div dir></div>', imports: [DirModule] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Existing, {
      className: 'Existing',
      filePath: 'existing_imports.ts',
      lineNumber: 7,
    });
})();

```

# /out/property_names.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Settings {
  readonly flags = { i0: true };

  enabled() {
    return this.flags.i0;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Settings, never> = function Settings_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Settings)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({
      token: Settings,
      factory: Settings.ɵfac,
      providedIn: 'root',
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Settings,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

```