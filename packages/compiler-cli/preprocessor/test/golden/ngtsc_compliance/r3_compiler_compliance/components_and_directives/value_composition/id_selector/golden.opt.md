# /out/id_selector.ngtypecheck.ts
```ts
/**
 * TCB for /id_selector.ts
 * @generated
 */

import * as i0 from './id_selector';

/*tcb1*/
function _tcb1(this: i0.SomeComponent) {
  if (true) {
  }
}

```

# /out/id_selector.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SomeComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeComponent, never> = function SomeComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SomeComponent,
    '#my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeComponent,
    selectors: [['', 'id', 'my-app']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function SomeComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: '#my-app',
                template: '',
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
    i0.ɵsetClassDebugInfo(SomeComponent, {
      className: 'SomeComponent',
      filePath: 'id_selector.ts',
      lineNumber: 7,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [SomeComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeComponent] });
})();

```