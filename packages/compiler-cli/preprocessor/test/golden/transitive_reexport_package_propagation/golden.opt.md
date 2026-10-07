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
import { Gm2ButtonModule } from '@fake-package/button';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './components/gm2/button/mat_button';

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
    dependencies: [Gm2ButtonModule, i1.MatButton],
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
                imports: [Gm2ButtonModule],
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

# /out/components/gm2/button/button_module.ts
```ts
import { NgModule } from '@angular/core';
import { MatButtonModule } from './mat_button_module';
// @ts-ignore
import * as i0 from '@angular/core';

export class Gm2ButtonModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Gm2ButtonModule, never> = function Gm2ButtonModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Gm2ButtonModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    Gm2ButtonModule,
    never,
    [typeof MatButtonModule],
    [typeof MatButtonModule]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Gm2ButtonModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Gm2ButtonModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MatButtonModule, MatButtonModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Gm2ButtonModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [MatButtonModule],
                exports: [MatButtonModule],
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
    i0.ɵɵsetNgModuleScope(Gm2ButtonModule, {
      imports: [MatButtonModule],
      exports: [MatButtonModule],
    });
})();

```

# /out/components/gm2/button/mat_button_module.ts
```ts
import { NgModule } from '@angular/core';
import { MatButton } from './mat_button';
// @ts-ignore
import * as i0 from '@angular/core';

export class MatButtonModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatButtonModule, never> = function MatButtonModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MatButtonModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MatButtonModule,
    [typeof MatButton],
    never,
    [typeof MatButton]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MatButtonModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MatButtonModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MatButtonModule,
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
    i0.ɵɵsetNgModuleScope(MatButtonModule, { declarations: [MatButton], exports: [MatButton] });
})();

```

# /out/components/gm2/button/mat_button.ngtypecheck.ts
```ts
/**
 * TCB for /components/gm2/button/mat_button.ts
 * @generated
 */

import * as i0 from './mat_button';

/*tcb1*/
function _tcb1(this: i0.MatButton) {
  if (true) {
  }
}

```

# /out/components/gm2/button/mat_button.ts
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
      filePath: 'components/gm2/button/mat_button.ts',
      lineNumber: 7,
    });
})();

```