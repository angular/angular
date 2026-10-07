# /out/nested_template_context_many_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /nested_template_context_many_bindings.ts
 * @generated
 */

import * as i0 from './nested_template_context_many_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*132,133*/ = _t1.$implicit; /*128,134*/
      var _t3 /*148,149*/ = _t1.index /*152,157*/; /*144,157*/
      var _t4 /*115,188*/ = document.createElement('div'); /*115,188*/ /*115,188*/
      _t4.addEventListener(/*160,165*/ 'click', ($event /*T:EP*/): any => {
        this._handleClick(/*168,180*/ _t2 /*181,182*/, _t3 /*184,185*/) /*168,186*/;
      }) /*159,187*/;
    }
  }
}

```

# /out/nested_template_context_many_bindings.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'div', 1);
    i0.ɵɵlistener('click', function MyComponent_div_0_Template_div_click_0_listener(): any {
      const ctx_r1: any = i0.ɵɵrestoreView(_r1);
      const d_r3: any = ctx_r1.$implicit;
      const i_r4: any = ctx_r1.index;
      const ctx_r4: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r4._handleClick(d_r3, i_r4));
    });
    i0.ɵɵelementEnd();
  }
}

export class MyComponent {
  _data = [1, 2, 3];
  _handleClick(d: any, i: any) {}
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
      [3, 'click', 4, 'ngFor', 'ngForOf'],
      [3, 'click'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngForOf', ctx._data);
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
        <div *ngFor="let d of _data; let i = index" (click)="_handleClick(d, i)"></div>
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
      filePath: 'nested_template_context_many_bindings.ts',
      lineNumber: 10,
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