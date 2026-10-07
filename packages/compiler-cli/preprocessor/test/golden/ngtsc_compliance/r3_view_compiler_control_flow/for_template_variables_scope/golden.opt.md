# /out/for_template_variables_scope.ngtypecheck.ts
```ts
/**
 * TCB for /for_template_variables_scope.ts
 * @generated
 */

import * as i0 from './for_template_variables_scope';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      this.$index /*73,79*/ /*73,79*/ +
      this.$count /*84,90*/ /*84,90*/ +
      this.$first /*95,101*/ /*95,101*/ +
      this.$last /*106,111*/ /*106,111*/;
    for (const _t1 /*129,133*/ of this.items /*137,142*/ /*137,142*/! /*137,142*/) {
      var _t2 /*157,157*/ = null! as number; /*T:VAE*/ /*157,157*/
      var _t3 /*157,157*/ = null! as number; /*T:VAE*/ /*157,157*/
      var _t4 /*157,157*/ = null! as boolean; /*T:VAE*/ /*157,157*/
      var _t5 /*157,157*/ = null! as boolean; /*T:VAE*/ /*157,157*/
      '' + _t2 /*160,166*/ + _t3 /*171,177*/ + _t4 /*182,188*/ + _t5 /*193,198*/;
      _t1 /*150,154*/;
    }
    '' +
      this.$index /*215,221*/ /*215,221*/ +
      this.$count /*226,232*/ /*226,232*/ +
      this.$first /*237,243*/ /*237,243*/ +
      this.$last /*248,253*/ /*248,253*/;
  }
}

```

# /out/for_template_variables_scope.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const $index_r1: any = ctx.$index;
    const ɵ$index_2_r2: any = ctx.$index;
    const $count_r3: any = ctx.$count;
    const ɵ$count_2_r4: any = ctx.$count;
    i0.ɵɵtextInterpolate4(
      ' ',
      $index_r1,
      ' ',
      $count_r3,
      ' ',
      ɵ$index_2_r2 === 0,
      ' ',
      ɵ$index_2_r2 === ɵ$count_2_r4 - 1,
      ' ',
    );
  }
}

export class MyApp {
  message = 'hello';
  items = [];

  // These variables are defined so that the template type checker doesn't raise an error.
  $index: any;
  $count: any;
  $first: any;
  $last: any;
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
    vars: 8,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵrepeaterCreate(
          1,
          MyApp_For_2_Template,
          1,
          4,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
        );
        i0.ɵɵtext(3);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate4(
          ' ',
          ctx.$index,
          ' ',
          ctx.$count,
          ' ',
          ctx.$first,
          ' ',
          ctx.$last,
          ' ',
        );
        i0.ɵɵadvance();
        i0.ɵɵrepeater(ctx.items);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate4(
          ' ',
          ctx.$index,
          ' ',
          ctx.$count,
          ' ',
          ctx.$first,
          ' ',
          ctx.$last,
          ' ',
        );
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
        {{$index}} {{$count}} {{$first}} {{$last}}

        @for (item of items; track item) {
          {{$index}} {{$count}} {{$first}} {{$last}}
        }

        {{$index}} {{$count}} {{$first}} {{$last}}
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
      filePath: 'for_template_variables_scope.ts',
      lineNumber: 15,
    });
})();

```