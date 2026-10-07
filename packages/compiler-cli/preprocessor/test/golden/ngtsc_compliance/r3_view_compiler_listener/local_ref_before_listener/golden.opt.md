# /out/local_ref_before_listener.ngtypecheck.ts
```ts
/**
 * TCB for /local_ref_before_listener.ts
 * @generated
 */

import * as i0 from './local_ref_before_listener';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*115,153*/ = document.createElement('button'); /*115,153*/ /*115,153*/
    var _t3 /*171,184*/ = document.createElement('input'); /*171,184*/ /*171,184*/
    var _t2 /*179,183*/ = _t3; /*178,183*/
    _t1.addEventListener(/*124,129*/ 'click', ($event /*T:EP*/): any => {
      this.onClick(/*132,139*/ _t2 /*140,144*/.value /*145,150*/ /*140,150*/) /*132,151*/;
    }) /*123,152*/;
  }
}

```

# /out/local_ref_before_listener.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  onClick(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 4,
    vars: 0,
    consts: [
      ['user', ''],
      [3, 'click'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        const _r1: any = i0.ɵɵgetCurrentView();
        i0.ɵɵelementStart(0, 'button', 1);
        i0.ɵɵlistener('click', function MyComponent_Template_button_click_0_listener(): any {
          i0.ɵɵrestoreView(_r1);
          const user_r2: any = i0.ɵɵreference(3);
          return i0.ɵɵresetView(ctx.onClick(user_r2.value));
        });
        i0.ɵɵtext(1, 'Save');
        i0.ɵɵelementEnd();
        i0.ɵɵelement(2, 'input', null, 0);
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
                selector: 'my-component',
                template: `
        <button (click)="onClick(user.value)">Save</button>
        <input #user>
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
      filePath: 'local_ref_before_listener.ts',
      lineNumber: 11,
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