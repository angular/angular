# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './lib';

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
    consts: [['foreign-dir', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: [i1.ForeignDirective],
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
                template: '<div foreign-dir></div>',
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
import { ForeignModule } from './lib';
import { ModA, ModC, ModD, ModE, provideB } from './local';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './lib';
// @ts-ignore
import * as i2 from './local';

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof AppComponent],
    [typeof i1.ForeignModule, typeof ModA, typeof i2.ModB, typeof ModC, typeof ModD],
    [typeof ModE]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [ForeignModule.forRoot(), ModA, provideB(), [ModC, ModD], ModE],
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
                declarations: [AppComponent],
                imports: [ForeignModule.forRoot(), ModA, provideB(), [ModC, ModD]],
                exports: [ModE],
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
      declarations: [AppComponent],
      imports: [i1.ForeignModule, ModA, i2.ModB, ModC, ModD],
      exports: [ModE],
    });
})();

```

# /out/lib.d.ts
```ts
import * as i0 from '@angular/core';
import { ModuleWithProviders } from '@angular/core';

export declare class ForeignDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ForeignDirective,
    '[foreign-dir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  >;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignDirective, never> = function ForeignDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ForeignDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ForeignDirective,
    '[foreign-dir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ForeignDirective,
    selectors: [['', 'foreign-dir', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ForeignDirective, [{ type: Directive }], null, null);
  }
}

export declare class ForeignModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    ForeignModule,
    [typeof ForeignDirective],
    never,
    [typeof ForeignDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<ForeignModule>;
  static forRoot(): ModuleWithProviders<ForeignModule>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignModule, never> = function ForeignModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ForeignModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    ForeignModule,
    [typeof ForeignDirective],
    never,
    [typeof ForeignDirective]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForeignModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ForeignModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ForeignModule, [{ type: NgModule }], null, null);
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(ForeignModule, {
      declarations: [ForeignDirective],
      exports: [ForeignDirective],
    });
})();

```

# /out/local.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ModA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModA, never> = function ModA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModA)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ModA, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModA });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModA> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ModA, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class ModB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModB, never> = function ModB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModB)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ModB, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModB });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModB> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ModB, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class ModC {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModC, never> = function ModC_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModC)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ModC, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModC });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModC> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ModC, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class ModD {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModD, never> = function ModD_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModD)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ModD, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModD });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModD> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ModD, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class ModE {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModE, never> = function ModE_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModE)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ModE, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModE });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModE> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ModE, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export function provideB() {
  return { ngModule: ModB, providers: [] };
}

```