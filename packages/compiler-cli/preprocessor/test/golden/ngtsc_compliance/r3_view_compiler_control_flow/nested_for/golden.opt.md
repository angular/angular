# /out/nested_for.ngtypecheck.ts
```ts
/**
 * TCB for /nested_for.ts
 * @generated
 */

import * as i0 from './nested_for';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      '' + _t1 /*142,146*/.name /*147,151*/ /*142,151*/;
      for (const _t2 /*176,183*/ of _t1 /*187,191*/.subItems /*192,200*/ /*187,200*/! /*187,200*/) {
        var _t3 /*217,217*/ = null! as number; /*T:VAE*/ /*217,217*/
        '' + _t2 /*220,227*/ + _t1 /*237,241*/.name /*242,246*/ /*237,246*/;
        _t3 /*208,214*/;
      }
      _t1 /*132,136*/;
    }
  }
}

```

# /out/nested_for.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_For_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const subitem_r1: any = ctx.$implicit;
    const item_r2: any = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate2(' ', subitem_r1, ' from ', item_r2.name, ' ');
  }
}
function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵrepeaterCreate(1, MyApp_For_3_For_2_Template, 1, 2, null, null, i0.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    const item_r2: any = ctx.$implicit;
    i0.ɵɵtextInterpolate1(' ', item_r2.name, ' ');
    i0.ɵɵadvance();
    i0.ɵɵrepeater(item_r2.subItems);
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
          @for (item of items; track item) {
            {{item.name}}
            @for (subitem of item.subItems; track $index) {
              {{subitem}} from {{item.name}}
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'nested_for.ts', lineNumber: 17 });
})();

```