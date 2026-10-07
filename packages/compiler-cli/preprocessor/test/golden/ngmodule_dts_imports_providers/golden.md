# /out/src/components/standalone-btn.component.ts
```ts
import { Component } from '@angular/core';
import { MockSnackBarModule } from 'mock_snack_bar';
// @ts-ignore
import * as i0 from '@angular/core';

export class StandaloneBtn {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneBtn, never> = function StandaloneBtn_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneBtn)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StandaloneBtn,
    'standalone-btn',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneBtn,
    selectors: [['standalone-btn']],
    decls: 2,
    vars: 0,
    template: function StandaloneBtn_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'button');
        i0.ɵɵtext(1, 'Click');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(StandaloneBtn, [MockSnackBarModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneBtn,
        [
          {
            type: Component,
            args: [
              {
                selector: 'standalone-btn',
                template: '<button>Click</button>',
                standalone: true,
                imports: [MockSnackBarModule],
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
    i0.ɵsetClassDebugInfo(StandaloneBtn, {
      className: 'StandaloneBtn',
      filePath: 'src/components/standalone-btn.component.ts',
      lineNumber: 10,
    });
})();

```

# /out/src/modules/parent.module.ts
```ts
import { NgModule } from '@angular/core';
import { StandaloneBtn } from 'repo/src/components/standalone-btn.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class ParentModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ParentModule, never> = function ParentModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ParentModule)();
  };
  // @ts-ignore
  static ɵmod: ParentModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ParentModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ParentModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [StandaloneBtn, StandaloneBtn],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ParentModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [StandaloneBtn],
                exports: [StandaloneBtn],
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
    i0.ɵɵsetNgModuleScope(ParentModule, { imports: [StandaloneBtn], exports: [StandaloneBtn] });
})();

```