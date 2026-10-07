# /out/switch_element_root_node.ngtypecheck.ts
```ts
/**
 * TCB for /switch_element_root_node.ts
 * @generated
 */

import * as i0 from './switch_element_root_node';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    switch (this.expr /*186,190*/ /*186,190*/) {
      case 0 /*207,208*/:
        var _t1 /*T:DIR:0*/ /*220,255*/ = null! as i0.Binding; /*T:VAE*/
        _t1.binding /*242,249*/ = 3 /*252,253*/ /*241,254*/;
        '' + this.expr /*257,261*/ /*257,261*/;
        break;
      case 1 /*291,292*/:
        var _t2 /*T:DIR:0*/ /*304,339*/ = null! as i0.Binding; /*T:VAE*/
        _t2.binding /*326,333*/ = 6 /*336,337*/ /*325,338*/;
        '' + this.expr /*341,345*/ /*341,345*/;
        break;
      default:
        var _t3 /*T:DIR:0*/ /*387,422*/ = null! as i0.Binding; /*T:VAE*/
        _t3.binding /*409,416*/ = 9 /*419,420*/ /*408,421*/;
        '' + this.expr /*424,428*/ /*424,428*/;
        break;
    }
  }
}

```

# /out/switch_element_root_node.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Case_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 0);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('binding', 3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}
function MyApp_Case_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('binding', 6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}
function MyApp_Case_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
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
        i0.ɵɵconditionalCreate(0, MyApp_Case_0_Template, 2, 2, 'div', 0)(
          1,
          MyApp_Case_1_Template,
          2,
          2,
          'div',
          1,
        )(2, MyApp_Case_2_Template, 2, 2, 'div', 2);
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵconditional((tmp_0_0 = ctx.expr) === 0 ? 0 : tmp_0_0 === 1 ? 1 : 2);
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
        @switch (expr) {
          @case (0) {
            <div foo="1" bar="2" [binding]="3">{{expr}}</div>
          }
          @case (1) {
            <div foo="4" bar="5" [binding]="6">{{expr}}</div>
          }
          @default {
            <div foo="7" bar="8" [binding]="9">{{expr}}</div>
          }
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
      filePath: 'switch_element_root_node.ts',
      lineNumber: 24,
    });
})();

```