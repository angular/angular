# /out/for_element_root_node_at_end.ngtypecheck.ts
```ts
/**
 * TCB for /for_element_root_node_at_end.ts
 * @generated
 */

import * as i0 from './for_element_root_node_at_end';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*183,187*/ of this.items /*191,196*/ /*191,196*/! /*191,196*/) {
      var _t2 /*T:DIR:0*/ /*224,259*/ = null! as i0.Binding; /*T:VAE*/
      _t2.binding /*246,253*/ = 3 /*256,257*/ /*245,258*/;
      '' + _t1 /*261,265*/;
      _t1 /*204,208*/;
    }
    var _t3 /*T:DIR:0*/ /*301,349*/ = null! as i0.Binding; /*T:VAE*/
    _t3.binding /*336,343*/ = 3 /*346,347*/ /*335,348*/;
  }
}

```

# /out/for_element_root_node_at_end.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Hello ');
    i0.ɵɵelementStart(1, 'div', 0);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty('binding', 3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function MyApp_ForEmpty_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Hello ');
    i0.ɵɵelementStart(1, 'span', 1);
    i0.ɵɵtext(2, 'Empty!');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty('binding', 3);
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
  items = [1, 2, 3];
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
      ['empty-foo', '1', 'empty-bar', '2', 3, 'binding'],
    ],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          3,
          2,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
          false,
          MyApp_ForEmpty_2_Template,
          3,
          1,
        );
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
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
        @for (item of items; track item) {
          Hello <div foo="1" bar="2" [binding]="3">{{item}}</div>
        } @empty {
          Hello <span empty-foo="1" empty-bar="2" [binding]="3">Empty!</span>
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
      filePath: 'for_element_root_node_at_end.ts',
      lineNumber: 18,
    });
})();

```