# /out/host_bindings_with_temporaries_use_null.ngtypecheck.ts
```ts
/**
 * TCB for /host_bindings_with_temporaries_use_null.ts
 * @generated
 */

import * as i0 from './host_bindings_with_temporaries_use_null';

/*tcb1*/
function _tcb1(this: i0.HostBindingDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this
      .getData /*115,122*/
      () /*115,124*/?.id /*126,128*/ /*115,128*/;
  }
}

```

# /out/host_bindings_with_temporaries_use_null.ts
```ts
import { Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingDir {
  getData: () =>
    | {
        id: number;
      }
    | undefined = () => undefined;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never> = function HostBindingDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingDir,
    '[hostBindingDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir,
    selectors: [['', 'hostBindingDir', '']],
    hostVars: 1,
    hostBindings: function HostBindingDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵdomProperty('id', (tmp_0_0 = ctx.getData()) == null ? null : tmp_0_0.id);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[hostBindingDir]',
                host: { '[id]': 'getData()?.id' },
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

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostBindingDir], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [HostBindingDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingDir] });
})();

```