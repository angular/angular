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
    decls: 2,
    vars: 0,
    consts: [['shared', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span', 0);
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵelementEnd();
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
                template: '<span shared>Hello</span>',
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
import { SHARED_IMPORTS } from './shared';
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
    imports: [SHARED_IMPORTS],
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
                imports: SHARED_IMPORTS,
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
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [AppComponent], imports: SHARED_IMPORTS });
})();

```

# /out/shared.ts
```ts
import { NgModule, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SharedDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedDirective, never> = function SharedDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SharedDirective,
    '[shared]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SharedDirective,
    selectors: [['', 'shared', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[shared]',
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

export class SharedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never> = function SharedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedModule)();
  };
  // @ts-ignore
  static ɵmod: SharedModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedDirective],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [SharedDirective],
                exports: [SharedDirective],
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
    i0.ɵɵsetNgModuleScope(SharedModule, {
      declarations: [SharedDirective],
      exports: [SharedDirective],
    });
})();

export const SHARED_IMPORTS = [SharedModule];

```