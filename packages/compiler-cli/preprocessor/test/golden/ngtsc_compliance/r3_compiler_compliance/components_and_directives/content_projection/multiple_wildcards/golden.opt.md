# /out/multiple_wildcards.ngtypecheck.ts
```ts
/**
 * TCB for /multiple_wildcards.ts
 * @generated
 */

import { Component, NgModule } from '@angular/core';

@Component({
  template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `,
  standalone: false,
})
class Cmp {}

/*tcb1*/
function _tcb1(this: Cmp) {
  if (true) {
  }
}

@NgModule({ declarations: [Cmp] })
class Module {}

```

# /out/multiple_wildcards.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*', [['', 'spacer', '']], '*'];
const _c1 = ['*', '[spacer]', '*'];

class Cmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Cmp, never> = function Cmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Cmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Cmp,
    'ng-component',
    never,
    {},
    {},
    never,
    ['*', '[spacer]', '*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Cmp,
    selectors: [['ng-component']],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 3,
    vars: 0,
    template: function Cmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0);
        i0.ɵɵprojection(1, 1);
        i0.ɵɵprojection(2, 2);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Cmp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <ng-content></ng-content>
        <ng-content select="[spacer]"></ng-content>
        <ng-content></ng-content>
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
    i0.ɵsetClassDebugInfo(Cmp, {
      className: 'Cmp',
      filePath: 'multiple_wildcards.ts',
      lineNumber: 11,
    });
})();

class Module {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Module, never> = function Module_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Module)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<Module, [typeof Cmp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Module });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Module> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Module,
        [{ type: NgModule, args: [{ declarations: [Cmp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(Module, { declarations: [Cmp] });
})();

```