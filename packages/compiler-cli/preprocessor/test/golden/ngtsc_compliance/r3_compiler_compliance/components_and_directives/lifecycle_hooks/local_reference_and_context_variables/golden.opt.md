# /out/local_reference_and_context_variables.ngtypecheck.ts
```ts
/**
 * TCB for /local_reference_and_context_variables.ts
 * @generated
 */

import * as i0 from './local_reference_and_context_variables';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*132,136*/ = _t1.$implicit; /*128,137*/
      var _t4 /*155,165*/ = document.createElement('div'); /*155,165*/ /*155,165*/
      var _t3 /*161,164*/ = _t4; /*160,164*/
      {
        '' + _t3 /*206,209*/ + _t2 /*218,222*/;
      }
    }
  }
}

```

# /out/local_reference_and_context_variables.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_span_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1: any = i0.ɵɵnextContext().$implicit;
    const foo_r2: any = i0.ɵɵreference(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(' ', foo_r2, ' - ', item_r1, ' ');
  }
}
function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵelement(1, 'div', null, 0);
    i0.ɵɵtemplate(3, MyComponent_div_0_span_3_Template, 2, 2, 'span', 2);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty('ngIf', ctx_r2.showing);
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
    vars: 1,
    consts: [
      ['foo', ''],
      [4, 'ngFor', 'ngForOf'],
      [4, 'ngIf'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 1, 'div', 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngForOf', ctx.items);
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
        <div *ngFor="let item of items">
           <div #foo></div>
            <span *ngIf="showing">
              {{ foo }} - {{ item }}
            </span>
        </div>`,
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
      filePath: 'local_reference_and_context_variables.ts',
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