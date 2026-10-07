# /out/host_bindings_quoted_names.ngtypecheck.ts
```ts
/**
 * TCB for /host_bindings_quoted_names.ts
 * @generated
 */

import * as i0 from './host_bindings_quoted_names';


/*tcb1*/
function _tcb1(this: i0.HostBindingDir) {
if (true) {

}
if ((true /*hostBindingsBlockGuard*/)) {
((this).is-a /*182,191*/) /*182,191*/;
((this).is-"b" /*221,230*/) /*221,230*/;
((this)."is-c" /*262,271*/) /*262,271*/;

}
}


```

# /out/host_bindings_quoted_names.ts
```ts
import { Directive, HostBinding, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingDir {
  'is-a': any;
  'is-"b"': any;
  '"is-c"': any;
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
    hostVars: 6,
    hostBindings: function HostBindingDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵclassProp('a', ctx['is-a'])('b', ctx['is-"b"'])('c', ctx['"is-c"']);
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
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          'is-a': [{ type: HostBinding, args: ['class.a'] }],
          'is-"b"': [{ type: HostBinding, args: ['class.b'] }],
          '"is-c"': [{ type: HostBinding, args: ['class.c'] }],
        },
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