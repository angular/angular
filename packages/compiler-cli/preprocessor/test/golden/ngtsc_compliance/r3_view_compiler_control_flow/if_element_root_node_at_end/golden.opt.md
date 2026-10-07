# /out/if_element_root_node_at_end.ngtypecheck.ts
```ts
/**
 * TCB for /if_element_root_node_at_end.ts
 * @generated
 */

import * as i0 from './if_element_root_node_at_end';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    if (this.expr /*182,186*/ /*182,186*/ === 0 /*191,192*/ /*182,192*/) {
      var _t1 /*T:DIR:0*/ /*208,243*/ = null! as i0.Binding; /*T:VAE*/
      _t1.binding /*230,237*/ = 3 /*240,241*/ /*229,242*/;
      '' + this.expr /*245,249*/ /*245,249*/;
    } else if (this.expr /*274,278*/ /*274,278*/ === 1 /*283,284*/ /*274,284*/) {
      var _t2 /*T:DIR:0*/ /*300,335*/ = null! as i0.Binding; /*T:VAE*/
      _t2.binding /*322,329*/ = 6 /*332,333*/ /*321,334*/;
      '' + this.expr /*337,341*/ /*337,341*/;
    } else {
      var _t3 /*T:DIR:0*/ /*376,411*/ = null! as i0.Binding; /*T:VAE*/
      _t3.binding /*398,405*/ = 9 /*408,409*/ /*397,410*/;
      '' + this.expr /*413,417*/ /*413,417*/;
    }
  }
}

```

# /out/if_element_root_node_at_end.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Hello ');
    i0.ɵɵelementStart(1, 'div', 0);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty('binding', 3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}
function MyApp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Hello ');
    i0.ɵɵelementStart(1, 'div', 1);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty('binding', 6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}
function MyApp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Hello ');
    i0.ɵɵelementStart(1, 'div', 2);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty('binding', 9);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}

export class Binding {
  binding = 0;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never> = function Binding_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Binding)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Binding,
    '[binding]',
    never,
    { 'binding': { 'alias': 'binding'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Binding,
    selectors: [['', 'binding', '']],
    inputs: { binding: 'binding' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Binding,
        [{ type: Directive, args: [{ selector: '[binding]' }] }],
        null,
        { binding: [{ type: Input }] },
      );
  }
}

export class MyApp {
  expr = 0;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    decls: 3,
    vars: 1,
    consts: [
      ['foo', '1', 'bar', '2', 3, 'binding'],
      ['foo', '4', 'bar', '5', 3, 'binding'],
      ['foo', '7', 'bar', '8', 3, 'binding'],
    ],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 3, 2)(
          1,
          MyApp_Conditional_1_Template,
          3,
          2,
        )(2, MyApp_Conditional_2_Template, 3, 2);
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.expr === 0 ? 0 : ctx.expr === 1 ? 1 : 2);
      }
    },
    dependencies: [Binding],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @if (expr === 0) {
          Hello <div foo="1" bar="2" [binding]="3">{{expr}}</div>
        } @else if (expr === 1) {
          Hello <div foo="4" bar="5" [binding]="6">{{expr}}</div>
        } @else {
          Hello <div foo="7" bar="8" [binding]="9">{{expr}}</div>
        }
      `,
                imports: [Binding],
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'if_element_root_node_at_end.ts',
      lineNumber: 20,
    });
})();

```