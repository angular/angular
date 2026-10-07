# /out/nested_elements.ngtypecheck.ts
```ts
/**
 * TCB for /nested_elements.ts
 * @generated
 */

import * as i0 from './nested_elements';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.one /*259,262*/ /*259,262*/;
    '' + _pipe1.transform(/*362,371*/ this.two /*356,359*/ /*356,359*/) /*356,371*/;
    '' + this.nestedInBlockTwo /*457,473*/ /*457,473*/;
  }
}

```

# /out/nested_elements.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
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

export class MyComponent {
  one = 1;
  two = 2;
  nestedInBlockTwo = '';
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
    decls: 9,
    vars: 5,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_882337278752123074$$_NESTED_ELEMENTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' My i18n block #{$interpolation} {$startTagSpan}Plain text in nested element{$closeTagSpan}',
            { 'closeTagSpan': '�/#2�', 'interpolation': '�0�', 'startTagSpan': '�#2�' },
            {
              original_code: {
                'closeTagSpan': '</span>',
                'interpolation': '{{ one }}',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_882337278752123074$$_NESTED_ELEMENTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` My i18n block #${'�0�'}:INTERPOLATION: ${'�#2�'}:START_TAG_SPAN:Plain text in nested element${'�/#2�'}:CLOSE_TAG_SPAN:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_725745709163573690$$_NESTED_ELEMENTS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            ' My i18n block #{$interpolation} {$startTagDiv}{$startTagDiv}{$startTagSpan} More bindings in more nested element: {$interpolation_1} {$closeTagSpan}{$closeTagDiv}{$closeTagDiv}',
            {
              'closeTagDiv': '[�/#7�|�/#6�]',
              'closeTagSpan': '�/#8�',
              'interpolation': '�0�',
              'interpolation_1': '�1�',
              'startTagDiv': '[�#6�|�#7�]',
              'startTagSpan': '�#8�',
            },
            {
              original_code: {
                'closeTagDiv': '</div>',
                'closeTagSpan': '</span>',
                'interpolation': '{{ two | uppercase }}',
                'interpolation_1': '{{ nestedInBlockTwo }}',
                'startTagDiv': '<div>',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_1 = MSG_EXTERNAL_725745709163573690$$_NESTED_ELEMENTS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize` My i18n block #${'�0�'}:INTERPOLATION: ${'[�#6�|�#7�]'}:START_TAG_DIV:${'[�#6�|�#7�]'}:START_TAG_DIV:${'�#8�'}:START_TAG_SPAN: More bindings in more nested element: ${'�1�'}:INTERPOLATION_1: ${'�/#8�'}:CLOSE_TAG_SPAN:${'[�/#7�|�/#6�]'}:CLOSE_TAG_DIV:${'[�/#7�|�/#6�]'}:CLOSE_TAG_DIV:`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1);
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, 'span');
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, 'div');
        i0.ɵɵi18nStart(4, 1);
        i0.ɵɵpipe(5, 'uppercase');
        i0.ɵɵelementStart(6, 'div')(7, 'div');
        i0.ɵɵelement(8, 'span');
        i0.ɵɵelementEnd()();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.one);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(6);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(5, 3, ctx.two))(ctx.nestedInBlockTwo);
        i0.ɵɵi18nApply(4);
      }
    },
    dependencies: [UppercasePipe],
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
        My i18n block #{{ one }}
        <span>Plain text in nested element</span>
      </div>
      <div i18n>
        My i18n block #{{ two | uppercase }}
        <div>
          <div>
            <span>
              More bindings in more nested element: {{ nestedInBlockTwo }}
            </span>
          </div>
        </div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'nested_elements.ts',
      lineNumber: 31,
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
    [typeof MyComponent, typeof UppercasePipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, UppercasePipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, UppercasePipe] });
})();

```