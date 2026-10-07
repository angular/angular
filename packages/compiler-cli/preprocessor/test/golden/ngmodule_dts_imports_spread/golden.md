# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [['dirC', '', 'dirD', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: '<div dirC dirD></div>',
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { EXTRA_MODULES } from './extra';
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
    imports: [...EXTRA_MODULES],
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
                imports: [...EXTRA_MODULES],
                declarations: [AppComponent],
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
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [AppComponent], imports: [...EXTRA_MODULES] });
})();

```

# /out/modules.ts
```ts
import { NgModule, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DirC {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirC, never> = function DirC_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirC)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirC,
    '[dirC]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirC,
    selectors: [['', 'dirC', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirC,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirC]',
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

export class ModuleC {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleC, never> = function ModuleC_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModuleC)();
  };
  // @ts-ignore
  static ɵmod: ModuleC = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModuleC });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModuleC> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [DirC],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleC,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [DirC],
                exports: [DirC],
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
    i0.ɵɵsetNgModuleScope(ModuleC, { declarations: [DirC], exports: [DirC] });
})();

export class DirD {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirD, never> = function DirD_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirD)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirD,
    '[dirD]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirD,
    selectors: [['', 'dirD', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirD,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirD]',
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

export class ModuleD {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleD, never> = function ModuleD_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModuleD)();
  };
  // @ts-ignore
  static ɵmod: ModuleD = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModuleD });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModuleD> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [DirD],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleD,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [DirD],
                exports: [DirD],
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
    i0.ɵɵsetNgModuleScope(ModuleD, { declarations: [DirD], exports: [DirD] });
})();

```