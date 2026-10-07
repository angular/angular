# /out/duplicate_animation_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /duplicate_animation_listeners.ts
 * @generated
 */

import * as i0 from './duplicate_animation_listeners';
import * as i1 from '@angular/animations';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    0 /*179,180*/;
    ($event: i1.AnimationEvent /*T:EP*/): any => {
      false /*130,135*/;
    };
    ($event: i1.AnimationEvent /*T:EP*/): any => {
      false /*157,162*/;
    };
  }
}

```

# /out/duplicate_animation_listeners.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵlistener(
          '@mySelector.start',
          function MyApp_Template_div_animation_mySelector_start_0_listener(): any {
            return false;
          },
        )(
          '@mySelector.done',
          function MyApp_Template_div_animation_mySelector_done_0_listener(): any {
            return false;
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('@mySelector', 0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template:
                  '<div (@mySelector.start)="false" (@mySelector.done)="false" [@mySelector]="0"></div>',
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'duplicate_animation_listeners.ts',
      lineNumber: 8,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] });
})();

```