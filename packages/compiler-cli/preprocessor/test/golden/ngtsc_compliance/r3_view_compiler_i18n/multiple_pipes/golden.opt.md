# /out/multiple_pipes.ngtypecheck.ts
```ts
/**
 * TCB for /multiple_pipes.ts
 * @generated
 */

import * as i0 from './multiple_pipes';

var _pipe1 = null! as i0.PipeA;
var _pipe2 = null! as i0.PipeB;
var _pipe3 = null! as i0.PipeC;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' +
      _pipe1.transform(/*156,161*/ this.valueA /*147,153*/ /*147,153*/) /*147,161*/ +
      _pipe2.transform(/*181,186*/ this.valueB /*172,178*/ /*172,178*/) /*172,186*/;
    '' + _pipe1.transform(/*226,231*/ this.valueA /*217,223*/ /*217,223*/) /*217,231*/;
    '' + _pipe2.transform(/*258,263*/ this.valueB /*249,255*/ /*249,255*/) /*249,263*/;
    '' + _pipe3.transform(/*289,294*/ this.valueC /*280,286*/ /*280,286*/) /*280,294*/;
  }
}

```

# /out/multiple_pipes.ts
```ts
import { Component, NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  valueA = 0;
  valueB = 0;
  valueC = 0;
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
    decls: 11,
    vars: 15,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3087172561491410158$$_MULTIPLE_PIPES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$interpolation} and {$interpolation_1}',
            { 'interpolation': '�0�', 'interpolation_1': '�1�' },
            {
              original_code: {
                'interpolation': '{{ valueA | pipeA }}',
                'interpolation_1': '{{ valueB | pipeB }}',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_3087172561491410158$$_MULTIPLE_PIPES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�0�'}:INTERPOLATION: and ${'�1�'}:INTERPOLATION_1:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1641175607905636072$$_MULTIPLE_PIPES_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagSpan}{$interpolation}{$closeTagSpan} and {$interpolation_1} {$startTagSpan}and {$interpolation_2}{$closeTagSpan}',
            {
              'closeTagSpan': '[�/#6�|�/#9�]',
              'interpolation': '�0�',
              'interpolation_1': '�1�',
              'interpolation_2': '�2�',
              'startTagSpan': '[�#6�|�#9�]',
            },
            {
              original_code: {
                'closeTagSpan': '</span>',
                'interpolation': '{{ valueA | pipeA }}',
                'interpolation_1': '{{ valueB | pipeB }}',
                'interpolation_2': '{{ valueC | pipeC }}',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_1 = MSG_EXTERNAL_1641175607905636072$$_MULTIPLE_PIPES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${'[�#6�|�#9�]'}:START_TAG_SPAN:${'�0�'}:INTERPOLATION:${'[�/#6�|�/#9�]'}:CLOSE_TAG_SPAN: and ${'�1�'}:INTERPOLATION_1: ${'[�#6�|�#9�]'}:START_TAG_SPAN:and ${'�2�'}:INTERPOLATION_2:${'[�/#6�|�/#9�]'}:CLOSE_TAG_SPAN:`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1);
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵpipe(2, 'pipeA');
        i0.ɵɵpipe(3, 'pipeB');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, 'div');
        i0.ɵɵi18nStart(5, 1);
        i0.ɵɵelement(6, 'span');
        i0.ɵɵpipe(7, 'pipeA');
        i0.ɵɵpipe(8, 'pipeB');
        i0.ɵɵelement(9, 'span');
        i0.ɵɵpipe(10, 'pipeC');
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 5, ctx.valueA))(i0.ɵɵpipeBind1(3, 7, ctx.valueB));
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(7);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(7, 9, ctx.valueA))(i0.ɵɵpipeBind1(8, 11, ctx.valueB))(
          i0.ɵɵpipeBind1(10, 13, ctx.valueC),
        );
        i0.ɵɵi18nApply(5);
      }
    },
    dependencies: (): any => [PipeA, PipeB, PipeC],
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
      <div i18n>{{ valueA | pipeA }} and {{ valueB | pipeB }}</div>
      <div i18n><span>{{ valueA | pipeA }}</span> and {{ valueB | pipeB }} <span>and {{ valueC | pipeC }}</span></div>
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
      filePath: 'multiple_pipes.ts',
      lineNumber: 11,
    });
})();

export class PipeA implements PipeTransform {
  transform() {
    return null;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeA, never> = function PipeA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeA)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeA, 'pipeA', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'pipeA',
    type: PipeA,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipeA,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipeA',
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

export class PipeB implements PipeTransform {
  transform() {
    return null;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeB, never> = function PipeB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeB)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeB, 'pipeB', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'pipeB',
    type: PipeB,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipeB,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipeB',
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

export class PipeC implements PipeTransform {
  transform() {
    return null;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeC, never> = function PipeC_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeC)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeC, 'pipeC', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'pipeC',
    type: PipeC,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipeC,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipeC',
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
    [typeof MyComponent, typeof PipeA, typeof PipeB, typeof PipeC],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, PipeA, PipeB, PipeC] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, PipeA, PipeB, PipeC] });
})();

```