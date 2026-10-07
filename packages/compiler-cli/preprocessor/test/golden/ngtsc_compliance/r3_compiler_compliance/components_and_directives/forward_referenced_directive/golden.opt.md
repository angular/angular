# /out/forward_referenced_directive.ngtypecheck.ts
```ts
/**
 * TCB for /forward_referenced_directive.ts
 * @generated
 */

import { Component, Directive, NgModule } from '@angular/core';

@Component({
  selector: 'host-binding-comp',
  template: ` <my-forward-directive></my-forward-directive> `,
  standalone: false,
})
export class HostBindingComp {}

/*tcb1*/
function _tcb1(this: HostBindingComp) {
  if (true) {
  }
}

@Directive({
  selector: 'my-forward-directive',
  standalone: false,
})
class MyForwardDirective {}

@NgModule({ declarations: [HostBindingComp, MyForwardDirective] })
export class MyModule {}

```

# /out/forward_referenced_directive.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingComp {
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
    standalone: false,
    decls: 1,
    vars: 0,
    template: function HostBindingComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'my-forward-directive');
      }
    },
    dependencies: (): any => [MyForwardDirective],
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
                template: `
        <my-forward-directive></my-forward-directive>
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
    i0.ɵsetClassDebugInfo(HostBindingComp, {
      className: 'HostBindingComp',
      filePath: 'forward_referenced_directive.ts',
      lineNumber: 10,
    });
})();

class MyForwardDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyForwardDirective, never> =
    function MyForwardDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyForwardDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyForwardDirective,
    'my-forward-directive',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyForwardDirective,
    selectors: [['my-forward-directive']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyForwardDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'my-forward-directive',
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof HostBindingComp, typeof MyForwardDirective],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [HostBindingComp, MyForwardDirective] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp, MyForwardDirective] });
})();

```