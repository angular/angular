# /out/embedded_view_listener_context.ngtypecheck.ts
```ts
/**
 * TCB for /embedded_view_listener_context.ts
 * @generated
 */

import * as i0 from './embedded_view_listener_context';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*132,135*/ = _t1.$implicit; /*128,135*/
      var _t3 /*143,175*/ = document.createElement('button'); /*143,175*/ /*143,175*/
      _t3.addEventListener(/*152,157*/ 'click', ($event /*T:EP*/): any => {
        _t2 /*160,163*/.value /*164,169*/ /*160,169*/ = 1 /*172,173*/ /*160,173*/;
      }) /*151,174*/;
    }
  }
}

```

# /out/embedded_view_listener_context.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵlistener(
      'click',
      function MyComponent_ng_template_0_Template_button_click_0_listener(): any {
        const obj_r2: any = i0.ɵɵrestoreView(_r1).$implicit;
        return i0.ɵɵresetView((obj_r2.value = 1));
      },
    );
    i0.ɵɵtext(1, 'Change');
    i0.ɵɵelementEnd();
  }
}

export class MyComponent {
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
    vars: 0,
    consts: [[3, 'click']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 2, 0, 'ng-template');
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
        <ng-template let-obj>
          <button (click)="obj.value = 1">Change</button>
        </ng-template>
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
      filePath: 'embedded_view_listener_context.ts',
      lineNumber: 12,
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