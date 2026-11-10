# /out/collisions.ts
```ts
import { Component } from '@angular/core';
import { DirModule } from './dir';
// @ts-ignore
import * as i0_1 from '@angular/core';

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
  static ɵfac: i0_1.ɵɵFactoryDeclaration<Cmp, never> = function Cmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Cmp)();
  };
  // @ts-ignore
  static ɵcmp: i0_1.ɵɵComponentDeclaration<Cmp, 'cmp', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0_1.ɵɵdefineComponent({
      type: Cmp,
      selectors: [['cmp']],
      decls: 1,
      vars: 0,
      consts: [['dir', '']],
      template: function Cmp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0_1.ɵɵelement(0, 'div', 0);
        }
      },
      dependencies: i0_1.ɵɵgetComponentDepsFactory(Cmp, [DirModule]),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0_1.ɵsetClassMetadata(
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
    i0_1.ɵsetClassDebugInfo(Cmp, { className: 'Cmp', filePath: 'collisions.ts', lineNumber: 11 });
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
  static ɵmod: DirModule =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DirModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DirModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [Dir] });
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

# /out/existing_imports.ts
```ts
import { Component } from '@angular/core';
import * as i0 from '@angular/core';
import { DirModule } from './dir';
import * as i1 from './dir';
// @ts-ignore
import * as i0_1 from '@angular/core';

export class Existing {
  version = i0.VERSION;
  readonly dir = i1.Dir;
  // @ts-ignore
  static ɵfac: i0_1.ɵɵFactoryDeclaration<Existing, never> = function Existing_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Existing)();
  };
  // @ts-ignore
  static ɵcmp: i0_1.ɵɵComponentDeclaration<
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
    /*@__PURE__*/ i0_1.ɵɵdefineComponent({
      type: Existing,
      selectors: [['existing']],
      decls: 1,
      vars: 0,
      consts: [['dir', '']],
      template: function Existing_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0_1.ɵɵelement(0, 'div', 0);
        }
      },
      dependencies: i0_1.ɵɵgetComponentDepsFactory(Existing, [DirModule]),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0_1.ɵsetClassMetadata(
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
    i0_1.ɵsetClassDebugInfo(Existing, {
      className: 'Existing',
      filePath: 'existing_imports.ts',
      lineNumber: 7,
    });
})();

```

# /out/inline_tcb_dir.ts
```ts
import { Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class StandaloneDir {
  sdir = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDir, never> = function StandaloneDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    StandaloneDir,
    '[sdir]',
    never,
    { 'sdir': { 'alias': 'sdir'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: StandaloneDir,
      selectors: [['', 'sdir', '']],
      inputs: { sdir: 'sdir' },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneDir,
        [{ type: Directive, args: [{ selector: '[sdir]' }] }],
        null,
        { sdir: [{ type: Input }] },
      );
  }
}

```

# /out/inline_tcb.ts
```ts
import { Component } from '@angular/core';
import { StandaloneDir } from './inline_tcb_dir';
// @ts-ignore
import * as i0_1 from '@angular/core';

const i0 = 1;

class InlineCmp {
  v = i0;
  // @ts-ignore
  static ɵfac: i0_1.ɵɵFactoryDeclaration<InlineCmp, never> = function InlineCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InlineCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0_1.ɵɵComponentDeclaration<
    InlineCmp,
    'inline-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0_1.ɵɵdefineComponent({
      type: InlineCmp,
      selectors: [['inline-cmp']],
      decls: 1,
      vars: 1,
      consts: [[3, 'sdir']],
      template: function InlineCmp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0_1.ɵɵelement(0, 'div', 0);
        }
        if (rf & 2) {
          i0_1.ɵɵproperty('sdir', 'ok');
        }
      },
      dependencies: i0_1.ɵɵgetComponentDepsFactory(InlineCmp, [StandaloneDir]),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0_1.ɵsetClassMetadata(
        InlineCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'inline-cmp',
                template: '<div [sdir]="\'ok\'"></div>',
                imports: [StandaloneDir],
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
    i0_1.ɵsetClassDebugInfo(InlineCmp, {
      className: 'InlineCmp',
      filePath: 'inline_tcb.ts',
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