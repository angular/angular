# /out/shared_snapshot_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /shared_snapshot_listeners.ts
 * @generated
 */

import * as i0 from './shared_snapshot_listeners';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      var _t1 /*145,171*/ = document.createElement('div'); /*145,171*/ /*145,171*/
      _t1.addEventListener(/*151,156*/ 'click', ($event /*T:EP*/): any => {
        this.onClick(/*159,166*/ 1 /*167,168*/) /*159,169*/;
      }) /*150,170*/;
      var _t2 /*184,214*/ = document.createElement('button'); /*184,214*/ /*184,214*/
      _t2.addEventListener(/*193,198*/ 'click', ($event /*T:EP*/): any => {
        this.onClick2(/*201,209*/ 2 /*210,211*/) /*201,212*/;
      }) /*192,213*/;
    }
  }
}

```

# /out/shared_snapshot_listeners.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'div')(1, 'div', 1);
    i0.ɵɵlistener('click', function MyComponent_div_0_Template_div_click_1_listener(): any {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r1.onClick(1));
    });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, 'button', 1);
    i0.ɵɵlistener('click', function MyComponent_div_0_Template_button_click_2_listener(): any {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r1.onClick2(2));
    });
    i0.ɵɵelementEnd()();
  }
}

export class MyComponent {
  onClick(name: any) {}
  onClick2(name: any) {}
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
    decls: 1,
    vars: 1,
    consts: [
      [4, 'ngIf'],
      [3, 'click'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.showing);
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
        <div *ngIf="showing">
          <div (click)="onClick(1)"></div>
          <button (click)="onClick2(2)"></button>
        </div>
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
      filePath: 'shared_snapshot_listeners.ts',
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