# /out/template_context_skip.ngtypecheck.ts
```ts
/**
 * TCB for /template_context_skip.ts
 * @generated
 */

import * as i0 from './template_context_skip';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*132,137*/ = _t1.$implicit; /*128,138*/
      var _t3 = null! as any; /*T:VAE*/
      {
        var _t4 /*172,178*/ = _t3.$implicit; /*168,179*/
        var _t5 = null! as any; /*T:VAE*/
        {
          var _t6 /*221,226*/ = _t5.$implicit; /*217,227*/
          '' + _t4 /*248,254*/.value /*255,260*/ /*248,260*/ + this.name /*269,273*/ /*269,273*/;
        }
      }
    }
  }
}

```

# /out/template_context_skip.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_div_1_div_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const middle_r1: any = i0.ɵɵnextContext().$implicit;
    const ctx_r1: any = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(' ', middle_r1.value, ' - ', ctx_r1.name, ' ');
  }
}
function MyComponent_div_0_div_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtemplate(1, MyComponent_div_0_div_1_div_1_Template, 2, 2, 'div', 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const middle_r1: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty('ngForOf', middle_r1.items);
  }
}
function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtemplate(1, MyComponent_div_0_div_1_Template, 2, 1, 'div', 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const outer_r3: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty('ngForOf', outer_r3.items);
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
    consts: [[4, 'ngFor', 'ngForOf']],
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
        <div *ngFor="let outer of items">
          <div *ngFor="let middle of outer.items">
            <div *ngFor="let inner of middle.items">
              {{ middle.value }} - {{ name }}
            </div>
          </div>
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
      filePath: 'template_context_skip.ts',
      lineNumber: 15,
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