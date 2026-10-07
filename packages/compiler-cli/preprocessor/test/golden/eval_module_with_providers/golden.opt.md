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
import * as i1 from './widget.component';

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
        i0.ɵɵelement(0, 'lib-widget');
      }
    },
    dependencies: [i1.WidgetComponent],
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
                template: '<lib-widget></lib-widget>',
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
import { WidgetProviders } from './widget.module';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './widget.module';

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
    [typeof i1.WidgetModule],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [WidgetProviders.forRoot()],
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
                imports: [WidgetProviders.forRoot()],
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
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [AppComponent], imports: [i1.WidgetModule] });
})();

```

# /out/widget.component.ngtypecheck.ts
```ts
/**
 * TCB for /widget.component.ts
 * @generated
 */

import * as i0 from './widget.component';

/*tcb1*/
function _tcb1(this: i0.WidgetComponent) {
  if (true) {
  }
}

```

# /out/widget.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class WidgetComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<WidgetComponent, never> = function WidgetComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || WidgetComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    WidgetComponent,
    'lib-widget',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: WidgetComponent,
    selectors: [['lib-widget']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function WidgetComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'Widget');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        WidgetComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'lib-widget',
                template: '<span>Widget</span>',
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
    i0.ɵsetClassDebugInfo(WidgetComponent, {
      className: 'WidgetComponent',
      filePath: 'widget.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/widget.module.ts
```ts
import { NgModule } from '@angular/core';
import { WidgetComponent } from './widget.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class WidgetModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<WidgetModule, never> = function WidgetModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || WidgetModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    WidgetModule,
    [typeof WidgetComponent],
    never,
    [typeof WidgetComponent]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: WidgetModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<WidgetModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        WidgetModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [WidgetComponent],
                exports: [WidgetComponent],
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
    i0.ɵɵsetNgModuleScope(WidgetModule, {
      declarations: [WidgetComponent],
      exports: [WidgetComponent],
    });
})();

export class WidgetProviders {
  static forRoot() {
    return { ngModule: WidgetModule, providers: [] };
  }
}

```