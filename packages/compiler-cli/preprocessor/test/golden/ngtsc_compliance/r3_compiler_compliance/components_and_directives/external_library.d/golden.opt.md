# /out/external_library.d.ts
```ts
import * as i0 from '@angular/core';

declare class LibDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<LibDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<LibDirective, 'lib-dir', never, {}, {}, never>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LibDirective, never> = function LibDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LibDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LibDirective,
    'lib-dir',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: LibDirective, selectors: [['lib-dir']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(LibDirective, [{ type: Directive }], null, null);
  }
}

export declare class LibModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<LibModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    LibModule,
    [typeof LibDirective],
    never,
    [typeof LibDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<LibModule>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LibModule, never> = function LibModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LibModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    LibModule,
    [typeof LibDirective],
    never,
    [typeof LibDirective]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LibModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LibModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(LibModule, [{ type: NgModule }], null, null);
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LibModule, { declarations: [LibDirective], exports: [LibDirective] });
})();

export { LibDirective as ɵangular_packages_forms_forms_a };
export { LibDirective };
export { LibDirective as ɵangular_packages_forms_forms_b };

```

# /out/library_exports.ngtypecheck.ts
```ts
/**
 * TCB for /library_exports.ts
 * @generated
 */

import * as i0 from './library_exports';

/*tcb1*/
function _tcb1(this: i0.TestComponent) {
  if (true) {
  }
}

```

# /out/library_exports.ts
```ts
// This test verifies that a directive from an external library is emitted using its declared name,
// even in the presence of alias exports that could have been chosen.
// See https://github.com/angular/angular/issues/41277.
import { Component, NgModule } from '@angular/core';
import { LibModule } from 'external_library';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from 'external_library';

export class TestComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'lib-dir');
      }
    },
    dependencies: [i1.LibDirective],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComponent,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <lib-dir></lib-dir>
      `,
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
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'library_exports.ts',
      lineNumber: 13,
    });
})();

export class TestModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestModule, never> = function TestModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TestModule,
    [typeof TestComponent],
    [typeof LibModule],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TestModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<TestModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [LibModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [TestComponent],
                imports: [LibModule],
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
    i0.ɵɵsetNgModuleScope(TestModule, { declarations: [TestComponent], imports: [LibModule] });
})();

```