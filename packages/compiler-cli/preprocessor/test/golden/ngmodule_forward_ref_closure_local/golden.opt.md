# /out/app.module.ngtypecheck.ts
```ts
/**
 * TCB for /app.module.ts
 * @generated
 */

import * as i0 from './app.module';

/*tcb1*/
function _tcb1(this: i0.MyForwardComponent) {
  if (true) {
  }
}

```

# /out/app.module.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyForwardComponent],
    never,
    [typeof MyForwardComponent]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MyModule,
    bootstrap: (): any => [MyForwardComponent],
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [
                  // @ts-ignore
                  MyForwardComponent,
                ],
                bootstrap: [
                  // @ts-ignore
                  MyForwardComponent,
                ],
                exports: [
                  // @ts-ignore
                  MyForwardComponent,
                ],
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
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: (): any => [MyForwardComponent],
      exports: (): any => [MyForwardComponent],
    });
})();

export class MyForwardComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyForwardComponent, never> =
    function MyForwardComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyForwardComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyForwardComponent,
    'my-forward',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyForwardComponent,
    selectors: [['my-forward']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function MyForwardComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Forward');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyForwardComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-forward',
                template: '<div>Forward</div>',
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
    i0.ɵsetClassDebugInfo(MyForwardComponent, {
      className: 'MyForwardComponent',
      filePath: 'app.module.ts',
      lineNumber: 15,
    });
})();

```