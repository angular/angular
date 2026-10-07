# /out/nested_template_context.ngtypecheck.ts
```ts
/**
 * TCB for /nested_template_context.ts
 * @generated
 */

import * as i0 from './nested_template_context';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*131,136*/ = _t1.$implicit; /*127,137*/
      var _t3 = null! as any; /*T:VAE*/
      {
        var _t4 /*170,176*/ = _t3.$implicit; /*166,177*/
        var _t5 = null! as any; /*T:VAE*/
        {
          var _t6 /*219,224*/ = _t5.$implicit; /*215,225*/
          this.format(
            /*310,316*/ _t2 /*317,322*/,
            _t4 /*324,330*/,
            _t6 /*332,337*/,
            this.component /*339,348*/ /*339,348*/,
          ) /*310,349*/;
          var _t7 /*202,365*/ = document.createElement('div'); /*202,365*/ /*202,365*/
          _t7.addEventListener(/*249,254*/ 'click', ($event /*T:EP*/): any => {
            this.onClick(/*257,264*/ _t2 /*265,270*/, _t4 /*272,278*/, _t6 /*280,285*/) /*257,286*/;
          }) /*248,287*/;
          '' +
            this.format(
              /*368,374*/ _t2 /*375,380*/,
              _t4 /*382,388*/,
              _t6 /*390,395*/,
              this.component /*397,406*/ /*397,406*/,
            ) /*368,407*/;
        }
      }
    }
  }
}

```

# /out/nested_template_context.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ul_0_li_1_div_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'div', 2);
    i0.ɵɵlistener(
      'click',
      function MyComponent_ul_0_li_1_div_1_Template_div_click_0_listener(): any {
        const inner_r2: any = i0.ɵɵrestoreView(_r1).$implicit;
        const middle_r3: any = i0.ɵɵnextContext().$implicit;
        const outer_r4: any = i0.ɵɵnextContext().$implicit;
        const ctx_r4: any = i0.ɵɵnextContext();
        return i0.ɵɵresetView(ctx_r4.onClick(outer_r4, middle_r3, inner_r2));
      },
    );
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const inner_r2: any = ctx.$implicit;
    const middle_r3: any = i0.ɵɵnextContext().$implicit;
    const outer_r4: any = i0.ɵɵnextContext().$implicit;
    const ctx_r4: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('title', ctx_r4.format(outer_r4, middle_r3, inner_r2, ctx_r4.component));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(' ', ctx_r4.format(outer_r4, middle_r3, inner_r2, ctx_r4.component), ' ');
  }
}
function MyComponent_ul_0_li_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'li');
    i0.ɵɵtemplate(1, MyComponent_ul_0_li_1_div_1_Template, 2, 2, 'div', 1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r4: any = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty('ngForOf', ctx_r4.items);
  }
}
function MyComponent_ul_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'ul');
    i0.ɵɵtemplate(1, MyComponent_ul_0_li_1_Template, 2, 1, 'li', 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const outer_r4: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty('ngForOf', outer_r4.items);
  }
}

export class MyComponent {
  component = this;
  format(outer: any, middle: any, inner: any) {}
  onClick(outer: any, middle: any, inner: any) {}
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
      [3, 'title', 'click', 4, 'ngFor', 'ngForOf'],
      [3, 'click', 'title'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ul_0_Template, 2, 1, 'ul', 0);
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
        <ul *ngFor="let outer of items">
          <li *ngFor="let middle of outer.items">
            <div *ngFor="let inner of items"
                 (click)="onClick(outer, middle, inner)"
                 [title]="format(outer, middle, inner, component)"
                 >
              {{format(outer, middle, inner, component)}}
            </div>
          </li>
        </ul>`,
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
      filePath: 'nested_template_context.ts',
      lineNumber: 18,
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