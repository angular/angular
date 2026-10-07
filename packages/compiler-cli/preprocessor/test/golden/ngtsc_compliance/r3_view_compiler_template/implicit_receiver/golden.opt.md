# /out/implicit_receiver.ngtypecheck.ts
```ts
/**
 * TCB for /implicit_receiver.ts
 * @generated
 */

import * as i0 from './implicit_receiver';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      var _t1 /*115,155*/ = document.createElement('div'); /*115,155*/ /*115,155*/
      _t1.addEventListener(/*134,139*/ 'click', ($event /*T:EP*/): any => {
        this.greet(/*142,147*/ this) /*142,153*/;
      }) /*133,154*/;
    }
    {
      this;
    }
  }
}

```

# /out/implicit_receiver.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'div', 2);
    i0.ɵɵlistener('click', function MyComponent_div_0_Template_div_click_0_listener(): any {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r1.greet(ctx_r1));
    });
    i0.ɵɵelementEnd();
  }
}
function MyComponent_div_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'div', 3);
  }
  if (rf & 2) {
    const ctx_r1: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('id', ctx_r1);
  }
}

export class MyComponent {
  greet(val: any) {}
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
    decls: 2,
    vars: 2,
    consts: [
      [3, 'click', 4, 'ngIf'],
      [3, 'id', 4, 'ngIf'],
      [3, 'click'],
      [3, 'id'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, 'div', 0)(
          1,
          MyComponent_div_1_Template,
          1,
          1,
          'div',
          1,
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', true);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', true);
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
        <div *ngIf="true" (click)="greet(this)"></div>
        <div *ngIf="true" [id]="this"></div>
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
      filePath: 'implicit_receiver.ts',
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