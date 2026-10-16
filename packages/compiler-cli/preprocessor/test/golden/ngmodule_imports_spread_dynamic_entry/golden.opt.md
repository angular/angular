# /out/router.ngtypecheck.ts
```ts
/**
 * TCB for /router.ts
 * @generated
 */

import * as i0 from './router';

/*tcb1*/
function _tcb1(this: i0.RouterOutlet) {
  if (true) {
  }
}

```

# /out/router.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class RouterOutlet {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RouterOutlet, never> = function RouterOutlet_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RouterOutlet)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    RouterOutlet,
    'router-outlet',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: RouterOutlet,
    selectors: [['router-outlet']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function RouterOutlet_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RouterOutlet,
        [
          {
            type: Component,
            args: [
              {
                selector: 'router-outlet',
                standalone: false,
                template: '',
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
    i0.ɵsetClassDebugInfo(RouterOutlet, {
      className: 'RouterOutlet',
      filePath: 'router.ts',
      lineNumber: 8,
    });
})();

export class RouterModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RouterModule, never> = function RouterModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RouterModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    RouterModule,
    [typeof RouterOutlet],
    never,
    [typeof RouterOutlet]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: RouterModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<RouterModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RouterModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [RouterOutlet],
                exports: [RouterOutlet],
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
    i0.ɵɵsetNgModuleScope(RouterModule, { declarations: [RouterOutlet], exports: [RouterOutlet] });
})();

```

# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/test.ts
```ts
import { Component, NgModule } from '@angular/core';
import { RouterModule } from './router';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './router';

export class DevToolsModule {
  static instrument() {
    return { ngModule: DevToolsModule };
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DevToolsModule, never> = function DevToolsModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DevToolsModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<DevToolsModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DevToolsModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DevToolsModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(DevToolsModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

const extraModules = [PRODUCTION ? [] : DevToolsModule.instrument()];

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
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'router-outlet');
      }
    },
    dependencies: [i1.RouterOutlet],
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
                standalone: false,
                template: `<router-outlet></router-outlet>`,
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
      filePath: 'test.ts',
      lineNumber: 20,
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
    imports: [RouterModule, ...extraModules],
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
                imports: [RouterModule, ...extraModules],
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
      imports: [RouterModule, ...extraModules],
    });
})();

```