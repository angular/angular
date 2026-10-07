# /out/app.module.ts
```ts
import { NgModule, forwardRef } from '@angular/core';
import { ExternalComponent } from './external.component';
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof ExternalComponent],
    never,
    [typeof ExternalComponent]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule, bootstrap: [ExternalComponent] });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [forwardRef(() => ExternalComponent)],
                exports: [forwardRef(() => ExternalComponent)],
                bootstrap: [forwardRef(() => ExternalComponent)],
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
      declarations: [ExternalComponent],
      exports: [ExternalComponent],
    });
})();

```

# /out/external.component.ngtypecheck.ts
```ts
/**
 * TCB for /external.component.ts
 * @generated
 */

import * as i0 from './external.component';

/*tcb1*/
function _tcb1(this: i0.ExternalComponent) {
  if (true) {
  }
}

```

# /out/external.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ExternalComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExternalComponent, never> =
    function ExternalComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExternalComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ExternalComponent,
    'external-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ExternalComponent,
    selectors: [['external-comp']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function ExternalComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'External');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExternalComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'external-comp',
                template: '<div>External</div>',
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
    i0.ɵsetClassDebugInfo(ExternalComponent, {
      className: 'ExternalComponent',
      filePath: 'external.component.ts',
      lineNumber: 8,
    });
})();

```