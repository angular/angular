# /out/app.component.ts
```ts
import { Component, NgModule } from '@angular/core';
import { RouterModule } from './router';
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
    consts: [['routerLink', '/']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'a', 0);
        i0.ɵɵtext(1, 'Home');
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
                template: `<a routerLink="/">Home</a>`,
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
  static ɵmod: AppModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [RouterModule.forRoot([])],
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
                imports: [RouterModule.forRoot([])],
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
      imports: [RouterModule.forRoot([])],
    });
})();

```

# /out/router.ts
```ts
import { NgModule, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class RouterLink {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RouterLink, never> = function RouterLink_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RouterLink)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    RouterLink,
    '[routerLink]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: RouterLink,
    selectors: [['', 'routerLink', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RouterLink,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[routerLink]',
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

export class RouterModule {
  static forRoot(routes: any[]) {
    return {
      ngModule: RouterModule,
      providers: [],
    };
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RouterModule, never> = function RouterModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RouterModule)();
  };
  // @ts-ignore
  static ɵmod: RouterModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: RouterModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<RouterModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [RouterLink],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RouterModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [RouterLink],
                exports: [RouterLink],
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
    i0.ɵɵsetNgModuleScope(RouterModule, { declarations: [RouterLink], exports: [RouterLink] });
})();

```