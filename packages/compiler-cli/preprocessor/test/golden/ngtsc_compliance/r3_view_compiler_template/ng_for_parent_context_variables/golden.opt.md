# /out/ng_for_parent_context_variables.ngtypecheck.ts
```ts
/**
 * TCB for /ng_for_parent_context_variables.ts
 * @generated
 */

import * as i0 from './ng_for_parent_context_variables';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*132,136*/ = _t1.$implicit; /*128,137*/
      var _t3 /*156,157*/ = _t1.index /*147,152*/; /*147,157*/
      {
        '' + _t3 /*194,195*/ + _t2 /*204,208*/;
      }
    }
  }
}

```

# /out/ng_for_parent_context_variables.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_span_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    const item_r2: any = ctx_r0.$implicit;
    const i_r3: any = ctx_r0.index;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(' ', i_r3, ' - ', item_r2, ' ');
  }
}
function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtemplate(1, MyComponent_div_0_span_1_Template, 2, 2, 'span', 1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r3: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty('ngIf', ctx_r3.showing);
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
      [4, 'ngFor', 'ngForOf'],
      [4, 'ngIf'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 2, 1, 'div', 0);
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
        <div *ngFor="let item of items; index as i">
            <span *ngIf="showing">
              {{ i }} - {{ item }}
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
      filePath: 'ng_for_parent_context_variables.ts',
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