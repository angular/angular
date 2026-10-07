# /out/for_aliased_template_variables.ngtypecheck.ts
```ts
/**
 * TCB for /for_aliased_template_variables.ts
 * @generated
 */

import * as i0 from './for_aliased_template_variables';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      var _t2 /*142,145*/ = null! as number; /*T:VAE*/ /*142,154*/
      var _t3 /*156,157*/ = null! as boolean; /*T:VAE*/ /*156,166*/
      var _t4 /*172,173*/ = null! as boolean; /*T:VAE*/ /*172,181*/
      var _t5 /*183,185*/ = null! as boolean; /*T:VAE*/ /*183,193*/
      var _t6 /*195,196*/ = null! as boolean; /*T:VAE*/ /*195,203*/
      var _t7 /*209,211*/ = null! as number; /*T:VAE*/ /*209,220*/
      '' +
        _t2 /*233,236*/ +
        _t3 /*248,249*/ +
        _t4 /*260,261*/ +
        _t5 /*272,274*/ +
        _t6 /*284,285*/ +
        _t7 /*297,299*/;
      _t1 /*132,136*/;
    }
  }
}

```

# /out/for_aliased_template_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ɵ$index_4_r1: any = ctx.$index;
    const ɵ$count_4_r2: any = ctx.$count;
    i0.ɵɵtextInterpolate6(
      ' Index: ',
      ɵ$index_4_r1,
      ' First: ',
      ɵ$index_4_r1 === 0,
      ' Last: ',
      ɵ$index_4_r1 === ɵ$count_4_r2 - 1,
      ' Even: ',
      ɵ$index_4_r1 % 2 === 0,
      ' Odd: ',
      ɵ$index_4_r1 % 2 !== 0,
      ' Count: ',
      ɵ$count_4_r2,
      ' ',
    );
  }
}

export class MyApp {
  message = 'hello';
  items = [];
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
          1,
          6,
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
          @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
            Index: {{idx}}
            First: {{f}}
            Last: {{l}}
            Even: {{ev}}
            Odd: {{o}}
            Count: {{co}}
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
      filePath: 'for_aliased_template_variables.ts',
      lineNumber: 19,
    });
})();

```