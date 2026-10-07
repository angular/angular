# /out/host_attributes.ngtypecheck.ts
```ts
/**
 * TCB for /host_attributes.ts
 * @generated
 */

import * as i0 from './host_attributes';

/*tcb1*/
function _tcb1(this: i0.HostAttributeDir) {
  if (true) {
  }
}

```

# /out/host_attributes.ts
```ts
import { Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostAttributeDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostAttributeDir, never> = function HostAttributeDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostAttributeDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostAttributeDir,
    '[hostAttributeDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostAttributeDir,
    selectors: [['', 'hostAttributeDir', '']],
    hostAttrs: ['aria-label', 'label'],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostAttributeDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[hostAttributeDir]',
                host: { 'aria-label': 'label' },
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof HostAttributeDir], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [HostAttributeDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostAttributeDir] });
})();

```