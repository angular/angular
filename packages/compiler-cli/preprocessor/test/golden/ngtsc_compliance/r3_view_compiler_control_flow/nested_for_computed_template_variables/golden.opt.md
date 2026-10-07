# /out/nested_for_computed_template_variables.ngtypecheck.ts
```ts
/**
 * TCB for /nested_for_computed_template_variables.ts
 * @generated
 */

import * as i0 from './nested_for_computed_template_variables';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*81,86*/ of this.items /*90,95*/ /*90,95*/! /*90,95*/) {
      var _t2 /*114,122*/ = null! as boolean; /*T:VAE*/ /*114,129*/
      var _t3 /*131,140*/ = null! as boolean; /*T:VAE*/ /*131,148*/
      var _t4 /*150,160*/ = null! as boolean; /*T:VAE*/ /*150,169*/
      var _t5 /*171,180*/ = null! as boolean; /*T:VAE*/ /*171,188*/
      '' + _t2 /*206,214*/ + _t3 /*219,228*/ + _t4 /*233,243*/ + _t5 /*248,257*/;
      for (const _t6 /*278,283*/ of this.items /*287,292*/ /*287,292*/! /*287,292*/) {
        var _t7 /*311,319*/ = null! as boolean; /*T:VAE*/ /*311,326*/
        var _t8 /*328,337*/ = null! as boolean; /*T:VAE*/ /*328,345*/
        var _t9 /*347,357*/ = null! as boolean; /*T:VAE*/ /*347,366*/
        var _t10 /*368,377*/ = null! as boolean; /*T:VAE*/ /*368,385*/
        '' + _t7 /*403,411*/ + _t8 /*416,425*/ + _t9 /*430,440*/ + _t10 /*445,454*/;
        '' +
          _t2 /*206,214*/ /*492,500*/ +
          _t3 /*219,228*/ /*505,514*/ +
          _t4 /*233,243*/ /*519,529*/ +
          _t5 /*248,257*/ /*534,543*/;
        for (const _t11 /*568,577*/ of this.items /*581,586*/ /*581,586*/! /*581,586*/) {
          var _t12 /*609,621*/ = null! as boolean; /*T:VAE*/ /*609,628*/
          var _t13 /*630,643*/ = null! as boolean; /*T:VAE*/ /*630,651*/
          var _t14 /*653,667*/ = null! as boolean; /*T:VAE*/ /*653,676*/
          var _t15 /*678,691*/ = null! as boolean; /*T:VAE*/ /*678,699*/
          '' + _t12 /*721,733*/ + _t13 /*738,751*/ + _t14 /*756,770*/ + _t15 /*775,788*/;
          '' +
            _t7 /*403,411*/ /*830,838*/ +
            _t8 /*416,425*/ /*843,852*/ +
            _t9 /*430,440*/ /*857,867*/ +
            _t10 /*445,454*/ /*872,881*/;
          '' +
            _t2 /*206,214*/ /*923,931*/ +
            _t3 /*219,228*/ /*936,945*/ +
            _t4 /*233,243*/ /*950,960*/ +
            _t5 /*248,257*/ /*965,974*/;
          _t11 /*594,603*/;
        }
        _t6 /*300,305*/;
      }
      _t1 /*103,108*/;
    }
  }
}

```

# /out/nested_for_computed_template_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_1_For_2_For_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelement(1, 'br');
    i0.ɵɵtext(2);
    i0.ɵɵelement(3, 'br');
    i0.ɵɵtext(4);
  }
  if (rf & 2) {
    const ɵ$index_8_r1: any = ctx.$index;
    const ɵ$count_8_r2: any = ctx.$count;
    const ctx_r2: any = i0.ɵɵnextContext();
    const ɵ$index_3_r4: any = ctx_r2.$index;
    const ɵ$count_3_r5: any = ctx_r2.$count;
    const ctx_r5: any = i0.ɵɵnextContext();
    const ɵ$index_1_r7: any = ctx_r5.$index;
    const ɵ$count_1_r8: any = ctx_r5.$count;
    i0.ɵɵtextInterpolate4(
      ' Innermost vars: ',
      ɵ$index_8_r1 % 2 !== 0,
      ' ',
      ɵ$index_8_r1 % 2 === 0,
      ' ',
      ɵ$index_8_r1 === 0,
      ' ',
      ɵ$index_8_r1 === ɵ$count_8_r2 - 1,
      ' ',
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(
      ' Inner vars: ',
      ɵ$index_3_r4 % 2 !== 0,
      ' ',
      ɵ$index_3_r4 % 2 === 0,
      ' ',
      ɵ$index_3_r4 === 0,
      ' ',
      ɵ$index_3_r4 === ɵ$count_3_r5 - 1,
      ' ',
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(
      ' Outer vars: ',
      ɵ$index_1_r7 % 2 !== 0,
      ' ',
      ɵ$index_1_r7 % 2 === 0,
      ' ',
      ɵ$index_1_r7 === 0,
      ' ',
      ɵ$index_1_r7 === ɵ$count_1_r8 - 1,
      ' ',
    );
  }
}
function MyApp_For_1_For_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelement(1, 'br');
    i0.ɵɵtext(2);
    i0.ɵɵrepeaterCreate(
      3,
      MyApp_For_1_For_2_For_4_Template,
      5,
      12,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity,
    );
  }
  if (rf & 2) {
    const ɵ$index_3_r4: any = ctx.$index;
    const ɵ$count_3_r5: any = ctx.$count;
    const ctx_r5: any = i0.ɵɵnextContext();
    const ɵ$index_1_r7: any = ctx_r5.$index;
    const ɵ$count_1_r8: any = ctx_r5.$count;
    const ctx_r8: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate4(
      ' Inner vars: ',
      ɵ$index_3_r4 % 2 !== 0,
      ' ',
      ɵ$index_3_r4 % 2 === 0,
      ' ',
      ɵ$index_3_r4 === 0,
      ' ',
      ɵ$index_3_r4 === ɵ$count_3_r5 - 1,
      ' ',
    );
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4(
      ' Outer vars: ',
      ɵ$index_1_r7 % 2 !== 0,
      ' ',
      ɵ$index_1_r7 % 2 === 0,
      ' ',
      ɵ$index_1_r7 === 0,
      ' ',
      ɵ$index_1_r7 === ɵ$count_1_r8 - 1,
      ' ',
    );
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r8.items);
  }
}
function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵrepeaterCreate(
      1,
      MyApp_For_1_For_2_Template,
      5,
      8,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity,
    );
  }
  if (rf & 2) {
    const ɵ$index_1_r7: any = ctx.$index;
    const ɵ$count_1_r8: any = ctx.$count;
    const ctx_r8: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate4(
      ' Outer vars: ',
      ɵ$index_1_r7 % 2 !== 0,
      ' ',
      ɵ$index_1_r7 % 2 === 0,
      ' ',
      ɵ$index_1_r7 === 0,
      ' ',
      ɵ$index_1_r7 === ɵ$count_1_r8 - 1,
      ' ',
    );
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r8.items);
  }
}

export class MyApp {
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
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          3,
          4,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
        );
      }
      if (rf & 2) {
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
        @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
          Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
          @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
            Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
            <br>
            Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
            @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
              Innermost vars: {{innermostOdd}} {{innermostEven}} {{innermostFirst}} {{innermostLast}}
              <br>
              Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
              <br>
              Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
            }
          }
        }
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
      filePath: 'nested_for_computed_template_variables.ts',
      lineNumber: 23,
    });
})();

```