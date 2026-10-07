# /out/implicit_receiver_keyed_write_inside_template.ngtypecheck.ts
```ts
/**
 * TCB for /implicit_receiver_keyed_write_inside_template.ts
 * @generated
 */

import * as i0 from './implicit_receiver_keyed_write_inside_template';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      var _t1 /*147,202*/ = document.createElement('button'); /*147,202*/ /*147,202*/
      _t1.addEventListener(/*156,161*/ 'click', ($event /*T:EP*/): any => {
        (this as any) /*164,174*/['mes' /*175,180*/ + 'sage' /*183,189*/ /*175,189*/] /*164,190*/ =
          'hello' /*193,200*/ /*164,200*/;
      }) /*155,201*/;
    }
  }
}

```

# /out/implicit_receiver_keyed_write_inside_template.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 1);
    i0.ɵɵlistener(
      'click',
      function MyComponent_ng_template_0_Template_button_click_0_listener(): any {
        i0.ɵɵrestoreView(_r1);
        const ctx_r1: any = i0.ɵɵnextContext();
        return i0.ɵɵresetView((ctx_r1['mes' + 'sage'] = 'hello'));
      },
    );
    i0.ɵɵtext(1, 'Click me');
    i0.ɵɵelementEnd();
  }
}

export class MyComponent {
  message = '';
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
    vars: 0,
    consts: [
      ['template', ''],
      [3, 'click'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(
          0,
          MyComponent_ng_template_0_Template,
          2,
          0,
          'ng-template',
          null,
          0,
          i0.ɵɵtemplateRefExtractor,
        );
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
        <ng-template #template>
          <button (click)="$any(this)['mes' + 'sage'] = 'hello'">Click me</button>
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
      filePath: 'implicit_receiver_keyed_write_inside_template.ts',
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