# /out/host_bindings_with_pure_functions.ngtypecheck.ts
```ts
/**
 * TCB for /host_bindings_with_pure_functions.ts
 * @generated
 */

import * as i0 from './host_bindings_with_pure_functions';

/*tcb1*/
function _tcb1(this: i0.HostBindingComp) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    ['red' /*118,123*/, this.id /*125,127*/ /*125,127*/] /*117,128*/;
  }
}

```

# /out/host_bindings_with_pure_functions.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => ['red', a0];

export class HostBindingComp {
  id = 'some id';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingComp, never> = function HostBindingComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostBindingComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostBindingComp,
    'host-binding-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostBindingComp,
    selectors: [['host-binding-comp']],
    hostVars: 3,
    hostBindings: function HostBindingComp_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('id', i0.ɵɵpureFunction1(1, _c0, ctx.id));
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function HostBindingComp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'host-binding-comp',
                host: { '[id]': '["red", id]' },
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
    i0.ɵsetClassDebugInfo(HostBindingComp, {
      className: 'HostBindingComp',
      filePath: 'host_bindings_with_pure_functions.ts',
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingComp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [HostBindingComp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp] });
})();

```