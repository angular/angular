# /out/app.module.ngtypecheck.ts
```ts
/**
 * TCB for /app.module.ts
 * @generated
 */

import * as i0 from './app.module';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/app.module.ts
```ts
import { Component, NgModule } from '@angular/core';
import { LocalModule, MyDirective } from './local.module';
import { conditionalFlag } from './config';
// @ts-ignore
import * as i0 from '@angular/core';

declare const DYNAMIC_MODULES: any[];

const moduleExports = conditionalFlag() ? [LocalModule] : [];
const directiveExports = conditionalFlag() ? [] : [MyDirective];

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
    consts: [['myDir', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
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
                template: '<div myDir></div>',
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
      filePath: 'app.module.ts',
      lineNumber: 15,
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
    imports: [LocalModule, ...DYNAMIC_MODULES],
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
                imports: [LocalModule, ...DYNAMIC_MODULES],
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
      imports: [LocalModule, ...DYNAMIC_MODULES],
    });
})();

export class ConditionalExportsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ConditionalExportsModule, never> =
    function ConditionalExportsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ConditionalExportsModule)();
    };
  // @ts-ignore
  static ɵmod: ConditionalExportsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ConditionalExportsModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ConditionalExportsModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [...directiveExports, ...moduleExports] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ConditionalExportsModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [...directiveExports, ...moduleExports],
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
    i0.ɵɵsetNgModuleScope(ConditionalExportsModule, {
      exports: [...directiveExports, ...moduleExports],
    });
})();

```

# /out/local.module.ts
```ts
import { Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never> = function MyDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDirective,
    '[myDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [['', 'myDir', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myDir]',
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

export class LocalModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalModule, never> = function LocalModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    LocalModule,
    [typeof MyDirective],
    never,
    [typeof MyDirective]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LocalModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LocalModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MyDirective],
                exports: [MyDirective],
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
    i0.ɵɵsetNgModuleScope(LocalModule, { declarations: [MyDirective], exports: [MyDirective] });
})();

```