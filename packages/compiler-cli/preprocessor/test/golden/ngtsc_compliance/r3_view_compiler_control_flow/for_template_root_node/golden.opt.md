# /out/for_template_root_node.ngtypecheck.ts
```ts
/**
 * TCB for /for_template_root_node.ts
 * @generated
 */

import * as i0 from './for_template_root_node';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*183,187*/ of this.items /*191,196*/ /*191,196*/! /*191,196*/) {
      var _t2 /*T:DIR:0*/ /*218,261*/ = null! as i0.Binding; /*T:VAE*/
      _t2.binding /*248,255*/ = 3 /*258,259*/ /*247,260*/;
      {
        '' + _t1 /*263,267*/;
      }
      _t1 /*204,208*/;
    }
    var _t3 /*T:DIR:0*/ /*305,360*/ = null! as i0.Binding; /*T:VAE*/
    _t3.binding /*347,354*/ = 3 /*357,358*/ /*346,359*/;
  }
}

```

# /out/for_template_root_node.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_1_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1: any = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyApp_For_1_ng_template_0_Template, 1, 1, 'ng-template', 0);
  }
  if (rf & 2) {
    i0.ɵɵproperty('binding', 3);
  }
}
function MyApp_ForEmpty_2_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, 'Empty!');
  }
}
function MyApp_ForEmpty_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyApp_ForEmpty_2_ng_template_0_Template, 1, 0, 'ng-template', 1);
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
          1,
          1,
          null,
          0,
          i0.ɵɵrepeaterTrackByIdentity,
          false,
          MyApp_ForEmpty_2_Template,
          1,
          1,
          null,
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
          <ng-template foo="1" bar="2" [binding]="3">{{item}}</ng-template>
        } @empty {
          <ng-template empty-foo="1" empty-bar="2" [binding]="3">Empty!</ng-template>
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
      filePath: 'for_template_root_node.ts',
      lineNumber: 18,
    });
})();

```