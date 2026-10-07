# /out/nested_for_template_variables.ngtypecheck.ts
```ts
/**
 * TCB for /nested_for_template_variables.ts
 * @generated
 */

import * as i0 from './nested_for_template_variables';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      '' + _t1 /*167,171*/.name /*172,176*/ /*167,176*/;
      var _t3 /*142,152*/ = null! as number; /*T:VAE*/ /*142,161*/
      for (const _t2 /*201,208*/ of _t1 /*212,216*/.subItems /*217,225*/ /*212,225*/! /*212,225*/) {
        var _t4 /*243,243*/ = null! as number; /*T:VAE*/ /*243,243*/
        '' + _t3 /*253,263*/ + _t4 /*275,281*/;
        _t2 /*233,240*/;
      }
      _t1 /*132,136*/;
    }
  }
}

```

# /out/nested_for_template_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_For_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const $count_r1: any = ctx.$count;
    const ɵ$count_4_r2: any = i0.ɵɵnextContext().$count;
    i0.ɵɵtextInterpolate2(' Outer: ', ɵ$count_4_r2, ' Inner: ', $count_r1, ' ');
  }
}
function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵrepeaterCreate(
      1,
      MyApp_For_3_For_2_Template,
      1,
      2,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity,
    );
  }
  if (rf & 2) {
    const item_r3: any = ctx.$implicit;
    i0.ɵɵtextInterpolate1(' ', item_r3.name, ' ');
    i0.ɵɵadvance();
    i0.ɵɵrepeater(item_r3.subItems);
  }
}

export class MyApp {
  message = 'hello';
  items = [
    { name: 'one', subItems: ['sub one', 'sub two', 'sub three'] },
    { name: 'two', subItems: ['sub one', 'sub two', 'sub three'] },
    { name: 'three', subItems: ['sub one', 'sub two', 'sub three'] },
  ];
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 4,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          3,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵrepeater(ctx.items);
      }
    },
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
        <div>
          {{message}}
          @for (item of items; track item; let outerCount = $count) {
            {{item.name}}
            @for (subitem of item.subItems; track subitem) {
              Outer: {{outerCount}}
              Inner: {{$count}}
            }
          }
        </div>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'nested_for_template_variables.ts',
      lineNumber: 18,
    });
})();

```