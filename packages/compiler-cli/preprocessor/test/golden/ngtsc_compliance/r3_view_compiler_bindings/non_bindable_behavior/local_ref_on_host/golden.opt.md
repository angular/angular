# /out/local_ref_on_host.ngtypecheck.ts
```ts
/**
 * TCB for /local_ref_on_host.ts
 * @generated
 */

import * as i0 from './local_ref_on_host';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t2 /*109,144*/ = document.createElement('b'); /*109,144*/ /*109,144*/
    var _t1 /*127,132*/ = _t2; /*126,132*/
    '' + _t1 /*186,191*/.id /*192,194*/ /*186,194*/;
  }
}

```

# /out/local_ref_on_host.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  name = 'John Doe';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-app']],
    standalone: false,
    decls: 5,
    vars: 1,
    consts: [
      ['myRef', ''],
      ['id', 'my-id'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'b', 1, 0);
        i0.ɵɵdisableBindings();
        i0.ɵɵelementStart(2, 'i');
        i0.ɵɵtext(3, 'Hello {{ name }}!');
        i0.ɵɵelementEnd();
        i0.ɵɵenableBindings();
        i0.ɵɵelementEnd();
        i0.ɵɵtext(4);
      }
      if (rf & 2) {
        const myRef_r1: any = i0.ɵɵreference(1);
        i0.ɵɵadvance(4);
        i0.ɵɵtextInterpolate1(' ', myRef_r1.id, ' ');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: `
        <b ngNonBindable #myRef id="my-id">
        <i>Hello {{ name }}!</i>
        </b>
        {{ myRef.id }}
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'local_ref_on_host.ts',
      lineNumber: 13,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```