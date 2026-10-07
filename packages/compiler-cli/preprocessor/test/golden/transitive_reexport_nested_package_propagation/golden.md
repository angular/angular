# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { AModule } from '@fake-package/a';
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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 1,
    vars: 0,
    consts: [['gm2-button', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [AModule]),
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
                standalone: true,
                template: '<button gm2-button></button>',
                imports: [AModule],
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
      lineNumber: 10,
    });
})();

```

# /out/components/a/a_module.ts
```ts
import { NgModule } from '@angular/core';
import { BModule } from '@fake-package/b';
// @ts-ignore
import * as i0 from '@angular/core';

export class AModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never> = function AModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AModule)();
  };
  // @ts-ignore
  static ɵmod: AModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [BModule, BModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [BModule],
                exports: [BModule],
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
    i0.ɵɵsetNgModuleScope(AModule, { imports: [BModule], exports: [BModule] });
})();

```

# /out/components/b/b_module.ts
```ts
import { NgModule } from '@angular/core';
import { MatButton } from './mat_button';
// @ts-ignore
import * as i0 from '@angular/core';

export class BModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never> = function BModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BModule)();
  };
  // @ts-ignore
  static ɵmod: BModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<BModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MatButton],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MatButton],
                exports: [MatButton],
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
    i0.ɵɵsetNgModuleScope(BModule, { declarations: [MatButton], exports: [MatButton] });
})();

```

# /out/components/b/mat_button.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];

export class MatButton {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatButton, never> = function MatButton_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MatButton)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatButton,
    'button[gm2-button]',
    never,
    {},
    {},
    never,
    ['*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MatButton,
    selectors: [['button', 'gm2-button', '']],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function MatButton_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵprojection(0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MatButton,
        [
          {
            type: Component,
            args: [
              {
                selector: 'button[gm2-button]',
                template: '<ng-content></ng-content>',
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
    i0.ɵsetClassDebugInfo(MatButton, {
      className: 'MatButton',
      filePath: 'components/b/mat_button.ts',
      lineNumber: 7,
    });
})();

```