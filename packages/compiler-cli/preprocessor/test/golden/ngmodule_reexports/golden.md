# /out/feature.module.ts
```ts
import { NgModule, Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FeatureComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FeatureComponent, never> = function FeatureComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FeatureComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FeatureComponent,
    'feature-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: FeatureComponent,
      selectors: [['feature-cmp']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function FeatureComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵtext(0, 'Feature');
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(FeatureComponent),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FeatureComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'feature-cmp',
                template: 'Feature',
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
    i0.ɵsetClassDebugInfo(FeatureComponent, {
      className: 'FeatureComponent',
      filePath: 'feature.module.ts',
      lineNumber: 8,
    });
})();

export class FeatureModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FeatureModule, never> = function FeatureModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FeatureModule)();
  };
  // @ts-ignore
  static ɵmod: FeatureModule =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FeatureModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FeatureModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [FeatureComponent] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FeatureModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [FeatureComponent],
                exports: [FeatureComponent],
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
    i0.ɵɵsetNgModuleScope(FeatureModule, {
      declarations: [FeatureComponent],
      exports: [FeatureComponent],
    });
})();

```

# /out/main.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
import { FinalFeatureModule } from './lib';
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComponent,
      selectors: [['app-root']],
      standalone: false,
      decls: 1,
      vars: 0,
      template: function AppComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'feature-cmp');
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
                template: '<feature-cmp></feature-cmp>',
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
      filePath: 'main.ts',
      lineNumber: 9,
    });
})();

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: AppModule =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [FinalFeatureModule] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [FinalFeatureModule],
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
    i0.ɵɵsetNgModuleScope(AppModule, {
      declarations: [AppComponent],
      imports: [FinalFeatureModule],
    });
})();

export class AppForwardComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppForwardComponent, never> =
    function AppForwardComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AppForwardComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppForwardComponent,
    'app-forward',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppForwardComponent,
      selectors: [['app-forward']],
      standalone: false,
      decls: 1,
      vars: 0,
      consts: [['laterDir', '']],
      template: function AppForwardComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'feature-cmp', 0);
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(AppForwardComponent),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppForwardComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-forward',
                template: '<feature-cmp laterDir></feature-cmp>',
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
    i0.ɵsetClassDebugInfo(AppForwardComponent, {
      className: 'AppForwardComponent',
      filePath: 'main.ts',
      lineNumber: 22,
    });
})();

export class LaterDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LaterDirective, never> = function LaterDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LaterDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LaterDirective,
    '[laterDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: LaterDirective,
      selectors: [['', 'laterDir', '']],
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LaterDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[laterDir]',
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

export class AppForwardModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppForwardModule, never> = function AppForwardModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppForwardModule)();
  };
  // @ts-ignore
  static ɵmod: AppForwardModule =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppForwardModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppForwardModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [FinalFeatureModule] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppForwardModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [FinalFeatureModule],
                declarations: [AppForwardComponent, LaterDirective],
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
    i0.ɵɵsetNgModuleScope(AppForwardModule, {
      declarations: [AppForwardComponent, LaterDirective],
      imports: [FinalFeatureModule],
    });
})();

```