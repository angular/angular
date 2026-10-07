# /out/for_both_aliased_and_original_variables.ngtypecheck.ts
```ts
/**
 * TCB for /for_both_aliased_and_original_variables.ts
 * @generated
 */

import * as i0 from './for_both_aliased_and_original_variables';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      var _t2 /*223,223*/ = null! as number; /*T:VAE*/ /*223,223*/
      var _t3 /*223,223*/ = null! as boolean; /*T:VAE*/ /*223,223*/
      var _t4 /*223,223*/ = null! as boolean; /*T:VAE*/ /*223,223*/
      var _t5 /*223,223*/ = null! as boolean; /*T:VAE*/ /*223,223*/
      var _t6 /*223,223*/ = null! as boolean; /*T:VAE*/ /*223,223*/
      var _t7 /*223,223*/ = null! as number; /*T:VAE*/ /*223,223*/
      '' +
        _t2 /*242,248*/ +
        _t3 /*269,275*/ +
        _t4 /*295,300*/ +
        _t5 /*320,325*/ +
        _t6 /*344,348*/ +
        _t7 /*369,375*/;
      var _t8 /*142,145*/ = null! as number; /*T:VAE*/ /*142,154*/
      var _t9 /*156,157*/ = null! as boolean; /*T:VAE*/ /*156,166*/
      var _t10 /*172,173*/ = null! as boolean; /*T:VAE*/ /*172,181*/
      var _t11 /*183,185*/ = null! as boolean; /*T:VAE*/ /*183,193*/
      var _t12 /*195,196*/ = null! as boolean; /*T:VAE*/ /*195,203*/
      var _t13 /*209,211*/ = null! as number; /*T:VAE*/ /*209,220*/
      '' +
        _t8 /*456,459*/ +
        _t9 /*479,480*/ +
        _t10 /*499,500*/ +
        _t11 /*519,521*/ +
        _t12 /*539,540*/ +
        _t13 /*560,562*/;
      _t1 /*132,136*/;
    }
  }
}

```

# /out/for_both_aliased_and_original_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelement(1, 'hr');
    i0.ɵɵtext(2);
  }
  if (rf & 2) {
    const $index_r1: any = ctx.$index;
    const ɵ$index_4_r2: any = ctx.$index;
    const $count_r3: any = ctx.$count;
    const ɵ$count_4_r4: any = ctx.$count;
    i0.ɵɵtextInterpolate6(
      ' Original index: ',
      $index_r1,
      ' Original first: ',
      ɵ$index_4_r2 === 0,
      ' Original last: ',
      ɵ$index_4_r2 === ɵ$count_4_r4 - 1,
      ' Original even: ',
      ɵ$index_4_r2 % 2 === 0,
      ' Original odd: ',
      ɵ$index_4_r2 % 2 !== 0,
      ' Original count: ',
      $count_r3,
      ' ',
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate6(
      ' Aliased index: ',
      ɵ$index_4_r2,
      ' Aliased first: ',
      ɵ$index_4_r2 === 0,
      ' Aliased last: ',
      ɵ$index_4_r2 === ɵ$count_4_r4 - 1,
      ' Aliased even: ',
      ɵ$index_4_r2 % 2 === 0,
      ' Aliased odd: ',
      ɵ$index_4_r2 % 2 !== 0,
      ' Aliased count: ',
      ɵ$count_4_r4,
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
          3,
          12,
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
            Original index: {{$index}}
            Original first: {{$first}}
            Original last: {{$last}}
            Original even: {{$even}}
            Original odd: {{$odd}}
            Original count: {{$count}}
            <hr>
            Aliased index: {{idx}}
            Aliased first: {{f}}
            Aliased last: {{l}}
            Aliased even: {{ev}}
            Aliased odd: {{o}}
            Aliased count: {{co}}
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
      filePath: 'for_both_aliased_and_original_variables.ts',
      lineNumber: 26,
    });
})();

```