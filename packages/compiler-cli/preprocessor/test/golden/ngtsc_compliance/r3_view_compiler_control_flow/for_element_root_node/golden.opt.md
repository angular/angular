# /out/for_element_root_node.ngtypecheck.ts
```ts
/**
 * TCB for /for_element_root_node.ts
 * @generated
 */

import * as i0 from './for_element_root_node';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*183,187*/ of this.items /*191,196*/ /*191,196*/! /*191,196*/) {
      var _t2 /*T:DIR:0*/ /*218,253*/ = null! as i0.Binding; /*T:VAE*/
      _t2.binding /*240,247*/ = 3 /*250,251*/ /*239,252*/;
      '' + _t1 /*255,259*/;
      _t1 /*204,208*/;
    }
    var _t3 /*T:DIR:0*/ /*289,337*/ = null! as i0.Binding; /*T:VAE*/
    _t3.binding /*324,331*/ = 3 /*334,335*/ /*323,336*/;
  }
}

```

# /out/for_element_root_node.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 0);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵproperty('binding', 3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function MyApp_ForEmpty_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span', 1);
    i0.ɵɵtext(1, 'Empty!');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
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
          2,
          2,
          'div',
          0,
          i0.ɵɵrepeaterTrackByIdentity,
          false,
          MyApp_ForEmpty_2_Template,
          2,
          1,
          'span',
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
          <div foo="1" bar="2" [binding]="3">{{item}}</div>
        } @empty {
          <span empty-foo="1" empty-bar="2" [binding]="3">Empty!</span>
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
      filePath: 'for_element_root_node.ts',
      lineNumber: 18,
    });
})();

```