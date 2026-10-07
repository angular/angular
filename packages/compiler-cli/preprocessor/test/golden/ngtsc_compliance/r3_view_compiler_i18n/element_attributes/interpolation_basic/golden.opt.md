# /out/interpolation_basic.ngtypecheck.ts
```ts
/**
 * TCB for /interpolation_basic.ts
 * @generated
 */

import * as i0 from './interpolation_basic';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*409,611*/ = null! as i0.DivDir; /*T:VAE*/
    _t1.al /*517,527*/ = '' + this.valueB /*532,538*/ /*532,538*/ /*517,542*/;
    _t1.arl /*573,593*/ = 'static text' /*573,607*/;
    '' + _pipe1.transform(/*475,484*/ this.valueA /*466,472*/ /*466,472*/) /*466,484*/;
    var _t2 /*T:DIR:0*/ /*620,802*/ = null! as i0.DivDir; /*T:VAE*/
    _t2.arl /*763,783*/ = '' + this.valueC /*788,794*/ /*788,794*/ /*763,798*/;
    '' +
      this.valueA /*673,679*/ /*673,679*/ +
      this.valueB /*690,696*/ /*690,696*/ +
      (this.valueA /*713,719*/ /*713,719*/ + this.valueB /*722,728*/ /*722,728*/) /*713,728*/;
  }
}

```

# /out/interpolation_basic.ts
```ts
import { Component, Directive, Input, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class UppercasePipe {
  transform(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UppercasePipe, never> = function UppercasePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UppercasePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<UppercasePipe, 'uppercase', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'uppercase',
      type: UppercasePipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UppercasePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'uppercase',
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

export class DivDir {
  al!: any;
  arl!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DivDir, never> = function DivDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DivDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DivDir,
    'div',
    never,
    {
      'al': { 'alias': 'aria-label'; 'required': false };
      'arl': { 'alias': 'aria-roledescription'; 'required': false };
    },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DivDir,
    selectors: [['div']],
    inputs: { al: [0, 'aria-label', 'al'], arl: [0, 'aria-roledescription', 'arl'] },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DivDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'div',
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          al: [{ type: Input, args: ['aria-label'] }],
          arl: [{ type: Input, args: ['aria-roledescription'] }],
        },
      );
  }
}

export class MyComponent {
  valueA: any;
  valueB: any;
  valueC: any;
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 5,
    vars: 8,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5526535577705876535$$_INTERPOLATION_BASIC_TS_0 =
          /* @ts-ignore */
          goog.getMsg('static text');
        i18n_0 = MSG_EXTERNAL_5526535577705876535$$_INTERPOLATION_BASIC_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`static text`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8977039798304050198$$_INTERPOLATION_BASIC_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            'intro {$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ valueA | uppercase }}' } },
          );
        i18n_1 = MSG_EXTERNAL_8977039798304050198$$_INTERPOLATION_BASIC_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`:m|d:intro ${'�0�'}:INTERPOLATION:`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc d1
         * @meaning m1
         */
        const MSG_EXTERNAL_7432761130955693041$$_INTERPOLATION_BASIC_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            '{$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ valueB }}' } },
          );
        i18n_2 = MSG_EXTERNAL_7432761130955693041$$_INTERPOLATION_BASIC_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`:m1|d1:${'�0�'}:INTERPOLATION:`;
      }
      let i18n_3;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc d2
         * @meaning m2
         */
        const MSG_EXTERNAL_7566208596013750546$$_INTERPOLATION_BASIC_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            '{$interpolation} and {$interpolation_1} and again {$interpolation_2}',
            { 'interpolation': '�0�', 'interpolation_1': '�1�', 'interpolation_2': '�2�' },
            {
              original_code: {
                'interpolation': '{{ valueA }}',
                'interpolation_1': '{{ valueB }}',
                'interpolation_2': '{{ valueA + valueB }}',
              },
            },
          );
        i18n_3 = MSG_EXTERNAL_7566208596013750546$$_INTERPOLATION_BASIC_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize`:m2|d2:${'�0�'}:INTERPOLATION: and ${'�1�'}:INTERPOLATION_1: and again ${'�2�'}:INTERPOLATION_2:`;
      }
      let i18n_4;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6639222533406278123$$_INTERPOLATION_BASIC_TS_4 =
          /* @ts-ignore */
          goog.getMsg(
            '{$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ valueC }}' } },
          );
        i18n_4 = MSG_EXTERNAL_6639222533406278123$$_INTERPOLATION_BASIC_TS_4;
      } else {
        /* @ts-ignore */
        i18n_4 = $localize`${'�0�'}:INTERPOLATION:`;
      }
      return [
        ['title', i18n_1, 'aria-label', i18n_2],
        ['title', i18n_3, 'aria-roledescription', i18n_4],
        ['id', 'dynamic-1', 'aria-roledescription', i18n_0, 6, 'title', 'aria-label'],
        ['id', 'dynamic-2', 6, 'title', 'aria-roledescription'],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 2);
        i0.ɵɵpipe(1, 'uppercase');
        i0.ɵɵi18nAttributes(2, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, 'div', 3);
        i0.ɵɵi18nAttributes(4, 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 6, ctx.valueA))(ctx.valueB);
        i0.ɵɵi18nApply(2);
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(ctx.valueA)(ctx.valueB)(ctx.valueA + ctx.valueB)(ctx.valueC);
        i0.ɵɵi18nApply(4);
      }
    },
    dependencies: [DivDir, UppercasePipe],
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
      <div id="dynamic-1"
        i18n-title="m|d" title="intro {{ valueA | uppercase }}"
        i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
        i18n-aria-roledescription aria-roledescription="static text"
      ></div>
      <div id="dynamic-2"
        i18n-title="m2|d2" title="{{ valueA }} and {{ valueB }} and again {{ valueA + valueB }}"
        i18n-aria-roledescription aria-roledescription="{{ valueC }}"
      ></div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'interpolation_basic.ts',
      lineNumber: 35,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof UppercasePipe, typeof MyComponent, typeof DivDir],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [UppercasePipe, MyComponent, DivDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [UppercasePipe, MyComponent, DivDir] });
})();

```