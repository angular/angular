# /out/operators.ngtypecheck.ts
```ts
/**
 * TCB for /operators.ts
 * @generated
 */

import * as i0 from './operators';

var _pipe1 = null! as i0.IdentityPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      (1 /*206,207*/ + 2 /*210,211*/) /*206,211*/ +
      ((1 /*219,220*/ % 2 /*223,224*/) /*219,224*/ +
        (3 /*228,229*/ / 4 /*232,233*/) /*228,233*/ *
          5 /*236,237*/ ** 6 /*241,242*/ /*236,242*/ /*228,242*/) /*218,242*/ +
      +1 /*250,251*/ /*249,251*/ +
      (typeof ({} /*265,267*/) /*258,267*/ === 'object' /*272,280*/) /*258,280*/ +
      !(typeof ({} /*296,298*/) /*289,298*/ === 'object' /*303,311*/ /*289,311*/) /*287,312*/ +
      (typeof this.foo /*326,329*/ /*326,329*/?.bar /*331,334*/ /*326,334*/ /*319,334*/ ===
        'string' /*339,347*/) /*319,347*/ +
      _pipe1.transform(
        /*372,380*/ typeof this.foo /*361,364*/ /*361,364*/
          ?.bar /*366,369*/ /*361,369*/ /*354,369*/,
      ) /*354,380*/ +
      void ('test' /*392,398*/) /*387,398*/ +
      (-1) /*407,408*/ /*406,408*/ ** 3 /*413,414*/ /*405,414*/ +
      ('bar' /*421,426*/ in this.foo /*430,433*/ /*430,433*/) /*421,433*/ +
      (this.bar /*440,443*/ /*440,443*/ instanceof this.Bar /*455,458*/ /*455,458*/) /*440,458*/;
    var _t1 /*510,540*/ = document.createElement('button'); /*510,540*/ /*510,540*/
    _t1.addEventListener(/*519,524*/ 'click', ($event /*T:EP*/): any => {
      this.number /*527,533*/ /*527,533*/ += 1 /*537,538*/; /*527,538*/
    }); /*518,539*/
    var _t2 /*554,584*/ = document.createElement('button'); /*554,584*/ /*554,584*/
    _t2.addEventListener(/*563,568*/ 'click', ($event /*T:EP*/): any => {
      this.number /*571,577*/ /*571,577*/ -= 1 /*581,582*/; /*571,582*/
    }); /*562,583*/
    var _t3 /*598,628*/ = document.createElement('button'); /*598,628*/ /*598,628*/
    _t3.addEventListener(/*607,612*/ 'click', ($event /*T:EP*/): any => {
      this.number /*615,621*/ /*615,621*/ *= 1 /*625,626*/; /*615,626*/
    }); /*606,627*/
    var _t4 /*642,672*/ = document.createElement('button'); /*642,672*/ /*642,672*/
    _t4.addEventListener(/*651,656*/ 'click', ($event /*T:EP*/): any => {
      this.number /*659,665*/ /*659,665*/ /= 1 /*669,670*/; /*659,670*/
    }); /*650,671*/
    var _t5 /*686,716*/ = document.createElement('button'); /*686,716*/ /*686,716*/
    _t5.addEventListener(/*695,700*/ 'click', ($event /*T:EP*/): any => {
      this.number /*703,709*/ /*703,709*/ %= 1 /*713,714*/; /*703,714*/
    }); /*694,715*/
    var _t6 /*730,761*/ = document.createElement('button'); /*730,761*/ /*730,761*/
    _t6.addEventListener(/*739,744*/ 'click', ($event /*T:EP*/): any => {
      this.number /*747,753*/ /*747,753*/ **= 1 /*758,759*/; /*747,759*/
    }); /*738,760*/
    var _t7 /*775,806*/ = document.createElement('button'); /*775,806*/ /*775,806*/
    _t7.addEventListener(/*784,789*/ 'click', ($event /*T:EP*/): any => {
      this.number /*792,798*/ /*792,798*/ &&= 1 /*803,804*/; /*792,804*/
    }); /*783,805*/
    var _t8 /*820,851*/ = document.createElement('button'); /*820,851*/ /*820,851*/
    _t8.addEventListener(/*829,834*/ 'click', ($event /*T:EP*/): any => {
      this.number /*837,843*/ /*837,843*/ ||= 1 /*848,849*/; /*837,849*/
    }); /*828,850*/
    var _t9 /*865,896*/ = document.createElement('button'); /*865,896*/ /*865,896*/
    _t9.addEventListener(/*874,879*/ 'click', ($event /*T:EP*/): any => {
      this.number /*882,888*/ /*882,888*/ ??= 1 /*893,894*/; /*882,894*/
    }); /*873,895*/
  }
}

```

# /out/operators.ts
```ts
import { Component, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({});

export class IdentityPipe {
  transform(value: any) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<IdentityPipe, never> = function IdentityPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || IdentityPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<IdentityPipe, 'identity', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'identity', type: IdentityPipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        IdentityPipe,
        [{ type: Pipe, args: [{ name: 'identity' }] }],
        null,
        null,
      );
  }
}

export class Bar {}

export class MyApp {
  foo: { bar?: string } = { bar: 'baz' };
  number = 1;
  bar = new Bar();
  Bar = Bar;
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
    decls: 11,
    vars: 15,
    consts: [[3, 'click']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, 'identity');
        i0.ɵɵdomElementStart(2, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_2_listener(): any {
          return (ctx.number += 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(3, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_3_listener(): any {
          return (ctx.number -= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(4, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_4_listener(): any {
          return (ctx.number *= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(5, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_5_listener(): any {
          return (ctx.number /= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(6, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_6_listener(): any {
          return (ctx.number %= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(7, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_7_listener(): any {
          return (ctx.number **= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(8, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_8_listener(): any {
          return (ctx.number &&= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(9, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_9_listener(): any {
          return (ctx.number ||= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(10, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_10_listener(): any {
          return (ctx.number ??= 1);
        });
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolateV([
          ' ',
          1 + 2,
          ' ',
          (1 % 2) + (3 / 4) * 5 ** 6,
          ' ',
          +1,
          ' ',
          typeof i0.ɵɵpureFunction0(13, _c0) === 'object',
          ' ',
          !(typeof i0.ɵɵpureFunction0(14, _c0) === 'object'),
          ' ',
          typeof ctx.foo?.bar === 'string',
          ' ',
          i0.ɵɵpipeBind1(1, 11, typeof ctx.foo?.bar),
          ' ',
          void 'test',
          ' ',
          (-1) ** 3,
          ' ',
          'bar' in ctx.foo,
          ' ',
          ctx.bar instanceof ctx.Bar,
          ' ',
        ]);
      }
    },
    dependencies: [IdentityPipe],
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
        {{ 1 + 2 }}
        {{ (1 % 2) + 3 / 4 * 5 ** 6 }}
        {{ +1 }}
        {{ typeof {} === 'object' }}
        {{ !(typeof {} === 'object') }}
        {{ typeof foo?.bar === 'string' }}
        {{ typeof foo?.bar | identity }}
        {{ void 'test' }}
        {{ (-1) ** 3 }}
        {{ 'bar' in foo }}
        {{ bar instanceof Bar }}
        <button (click)="number += 1"></button>
        <button (click)="number -= 1"></button>
        <button (click)="number *= 1"></button>
        <button (click)="number /= 1"></button>
        <button (click)="number %= 1"></button>
        <button (click)="number **= 1"></button>
        <button (click)="number &&= 1"></button>
        <button (click)="number ||= 1"></button>
        <button (click)="number ??= 1"></button>
      `,
                imports: [IdentityPipe],
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'operators.ts', lineNumber: 37 });
})();

```