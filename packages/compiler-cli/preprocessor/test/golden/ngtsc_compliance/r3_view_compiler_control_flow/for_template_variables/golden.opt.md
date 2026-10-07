# /out/for_template_variables.ngtypecheck.ts
```ts
/**
 * TCB for /for_template_variables.ts
 * @generated
 */

import * as i0 from './for_template_variables';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      var _t2 /*139,139*/ = null! as number; /*T:VAE*/ /*139,139*/
      var _t3 /*139,139*/ = null! as boolean; /*T:VAE*/ /*139,139*/
      var _t4 /*139,139*/ = null! as boolean; /*T:VAE*/ /*139,139*/
      var _t5 /*139,139*/ = null! as boolean; /*T:VAE*/ /*139,139*/
      var _t6 /*139,139*/ = null! as boolean; /*T:VAE*/ /*139,139*/
      var _t7 /*139,139*/ = null! as number; /*T:VAE*/ /*139,139*/
      '' +
        _t2 /*149,155*/ +
        _t3 /*167,173*/ +
        _t4 /*184,189*/ +
        _t5 /*200,205*/ +
        _t6 /*215,219*/ +
        _t7 /*231,237*/;
      _t1 /*132,136*/;
    }
  }
}

```

# /out/for_template_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const $index_r1: any = ctx.$index;
    const ɵ$index_4_r2: any = ctx.$index;
    const $count_r3: any = ctx.$count;
    const ɵ$count_4_r4: any = ctx.$count;
    i0.ɵɵtextInterpolate6(
      ' Index: ',
      $index_r1,
      ' First: ',
      ɵ$index_4_r2 === 0,
      ' Last: ',
      ɵ$index_4_r2 === ɵ$count_4_r4 - 1,
      ' Even: ',
      ɵ$index_4_r2 % 2 === 0,
      ' Odd: ',
      ɵ$index_4_r2 % 2 !== 0,
      ' Count: ',
      $count_r3,
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
          @for (item of items; track item) {
            Index: {{$index}}
            First: {{$first}}
            Last: {{$last}}
            Even: {{$even}}
            Odd: {{$odd}}
            Count: {{$count}}
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
      filePath: 'for_template_variables.ts',
      lineNumber: 19,
    });
})();

```