# /out/src/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { CompA } from './comp-a.component';
import { CompB } from './comp-b.component';
import { DirWithHost } from './dir-with-host.directive';
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
  static ɵmod: AppModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [CompA, CompB, DirWithHost],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [CompA, CompB, DirWithHost],
                exports: [CompA, CompB, DirWithHost],
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
      declarations: [CompA, CompB, DirWithHost],
      exports: [CompA, CompB, DirWithHost],
    });
})();

```

# /out/src/comp-a.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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
    decls: 2,
    vars: 0,
    consts: [['dirWithHost', '']],
    template: function CompA_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵelement(1, 'comp-b');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(CompA),
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
                template: '<div dirWithHost><comp-b></comp-b></div>',
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
      filePath: 'src/comp-a.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/src/comp-b.component.ts
```ts
import { Component } from '@angular/core';
import { CompA } from './comp-a.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompB {
  compA: CompA | null = null;
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
    decls: 2,
    vars: 0,
    template: function CompB_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'CompB');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(CompB),
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
                template: '<div>CompB</div>',
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
    i0.ɵsetClassDebugInfo(CompB, {
      className: 'CompB',
      filePath: 'src/comp-b.component.ts',
      lineNumber: 9,
    });
})();

```

# /out/src/dir-with-host.directive.ts
```ts
import { Directive } from '@angular/core';
import { HostDir } from './host.directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class DirWithHost {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirWithHost, never> = function DirWithHost_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirWithHost)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirWithHost,
    '[dirWithHost]',
    never,
    {},
    {},
    never,
    never,
    false,
    [{ directive: typeof HostDir; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirWithHost,
    selectors: [['', 'dirWithHost', '']],
    standalone: false,
    features: [i0.ɵɵHostDirectivesFeature([HostDir])],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirWithHost,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirWithHost]',
                standalone: false,
                hostDirectives: [
                  {
                    directive: HostDir,
                  },
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```

# /out/src/host.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never> = function HostDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostDir,
    '[hostDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: HostDir, selectors: [['', 'hostDir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[hostDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```