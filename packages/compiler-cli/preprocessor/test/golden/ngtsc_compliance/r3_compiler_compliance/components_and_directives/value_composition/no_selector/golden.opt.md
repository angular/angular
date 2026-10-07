# /out/no_selector.ngtypecheck.ts
```ts
/**
 * TCB for /no_selector.ts
 * @generated
 */

import * as i0 from './no_selector';

/*tcb1*/
function _tcb1(this: i0.EmptyOutletComponent) {
  if (true) {
  }
}

```

# /out/no_selector.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class RouterOutlet {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RouterOutlet, never> = function RouterOutlet_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || RouterOutlet)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    RouterOutlet,
    'router-outlet',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: RouterOutlet,
    selectors: [['router-outlet']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RouterOutlet,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'router-outlet',
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

export class EmptyOutletComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EmptyOutletComponent, never> =
    function EmptyOutletComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || EmptyOutletComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EmptyOutletComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EmptyOutletComponent,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function EmptyOutletComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'router-outlet');
      }
    },
    dependencies: [RouterOutlet],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EmptyOutletComponent,
        [
          {
            type: Component,
            args: [
              {
                template: '<router-outlet></router-outlet>',
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
    i0.ɵsetClassDebugInfo(EmptyOutletComponent, {
      className: 'EmptyOutletComponent',
      filePath: 'no_selector.ts',
      lineNumber: 14,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof EmptyOutletComponent, typeof RouterOutlet],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [EmptyOutletComponent, RouterOutlet] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [EmptyOutletComponent, RouterOutlet] });
})();

```