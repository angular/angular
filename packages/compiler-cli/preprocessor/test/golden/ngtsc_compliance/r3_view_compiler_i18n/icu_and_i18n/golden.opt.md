# /out/icu_and_i18n.ngtypecheck.ts
```ts
/**
 * TCB for /icu_and_i18n.ts
 * @generated
 */

import * as i0 from './icu_and_i18n';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*135,143*/ = _t1.$implicit; /*131,144*/
      '' + _t2 /*157,165*/.name /*166,170*/ /*157,170*/;
      '' + _t2 /*186,194*/.length /*195,201*/ /*186,201*/;
    }
  }
}

```

# /out/icu_and_i18n.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵdomElement(1, 'div');
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const diskView_r1: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(diskView_r1.name)(diskView_r1.length);
    i0.ɵɵi18nApply(0);
  }
}

export class MyComponent {
  disks: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    decls: 3,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5731037447622183595$$_ICU_AND_I18N_TS_0 =
          /* @ts-ignore */
          goog.getMsg('{VAR_PLURAL, plural, =1 {VM} other {VMs}}');
        i18n_0 = MSG_EXTERNAL_5731037447622183595$$_ICU_AND_I18N_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_PLURAL, plural, =1 {VM} other {VMs}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { 'VAR_PLURAL': '�1:1�' });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7553006261446141114$$_ICU_AND_I18N_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagDiv} {$interpolation} has {$icu} {$closeTagDiv}',
            {
              'closeTagDiv': '�/#1:1��/*2:1�',
              'icu': i18n_0,
              'interpolation': '�0:1�',
              'startTagDiv': '�*2:1��#1:1�',
            },
            {
              original_code: {
                'closeTagDiv': '</div>',
                'icu': '{diskView.length, plural, =1 {VM} other {VMs}}',
                'interpolation': '{{diskView.name}}',
                'startTagDiv': '<div *ngFor="let diskView of disks">',
              },
            },
          );
        i18n_1 = MSG_EXTERNAL_7553006261446141114$$_ICU_AND_I18N_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${'�*2:1��#1:1�'}:START_TAG_DIV: ${'�0:1�'}:INTERPOLATION: has ${i18n_0}:ICU@@6698398538955432050: ${'�/#1:1��/*2:1�'}:CLOSE_TAG_DIV:`;
      }
      return [i18n_1, [4, 'ngFor', 'ngForOf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomTemplate(2, MyComponent_div_2_Template, 2, 2, 'div', 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵdomProperty('ngForOf', ctx.disks);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component',
                template: `
        <div i18n>
          <div *ngFor="let diskView of disks">
            {{diskView.name}} has {diskView.length, plural, =1 {VM} other {VMs}}
          </div>
        </div>
      `,
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'icu_and_i18n.ts',
      lineNumber: 13,
    });
})();

```