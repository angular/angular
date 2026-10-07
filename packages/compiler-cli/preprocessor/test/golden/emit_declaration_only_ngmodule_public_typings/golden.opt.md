# /out/permissions_checker.ts
```ts
import { Component, EventEmitter, NgModule, Output, forwardRef } from '@angular/core';
import { AveLoggingModule } from '@external/ave-logging';
import { FooModule, provideFoo } from '@external/foo';
import { ForwardModule } from '@external/forward';
// @ts-ignore
import * as i0 from '@angular/core';

export interface PermissionsCheckerState {
  allowed: boolean;
}

export class PermissionsChecker {
  readonly stateChange = new EventEmitter<PermissionsCheckerState>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PermissionsChecker, never> =
    function PermissionsChecker_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PermissionsChecker)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    PermissionsChecker,
    'permissions-checker',
    never,
    {},
    { 'stateChange': 'stateChange' },
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: PermissionsChecker,
    selectors: [['permissions-checker']],
    outputs: { stateChange: 'stateChange' },
    standalone: false,
    decls: 2,
    vars: 0,
    template: function PermissionsChecker_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Permissions');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(PermissionsChecker),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PermissionsChecker,
        [
          {
            type: Component,
            args: [
              {
                selector: 'permissions-checker',
                template: '<div>Permissions</div>',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { stateChange: [{ type: Output }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(PermissionsChecker, {
      className: 'PermissionsChecker',
      filePath: 'permissions_checker.ts',
      lineNumber: 15,
    });
})();

export class LocalHelperModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalHelperModule, never> =
    function LocalHelperModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalHelperModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<LocalHelperModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LocalHelperModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LocalHelperModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

function getLocalImports() {
  return [LocalHelperModule];
}

const NG_MODULE_IMPORTS = [AveLoggingModule];

export class PermissionsCheckerModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PermissionsCheckerModule, never> =
    function PermissionsCheckerModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PermissionsCheckerModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    PermissionsCheckerModule,
    never,
    never,
    [typeof PermissionsChecker]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: PermissionsCheckerModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<PermissionsCheckerModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

```