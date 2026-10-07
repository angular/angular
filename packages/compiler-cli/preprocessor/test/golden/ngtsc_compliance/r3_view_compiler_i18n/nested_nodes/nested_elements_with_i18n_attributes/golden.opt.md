# /out/nested_elements_with_i18n_attributes.ngtypecheck.ts
```ts
/**
 * TCB for /nested_elements_with_i18n_attributes.ts
 * @generated
 */

import * as i0 from './nested_elements_with_i18n_attributes';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.valueA /*273,279*/ /*273,279*/;
    '' + this.valueB /*325,331*/ /*325,331*/ + this.valueC /*342,348*/ /*342,348*/;
    '' + _pipe1.transform(/*466,475*/ this.valueD /*457,463*/ /*457,463*/) /*457,475*/;
    '' + this.valueE /*521,527*/ /*521,527*/;
  }
}

```

# /out/nested_elements_with_i18n_attributes.ts
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
  valueA!: any;
  valueB!: any;
  valueC!: any;
  valueD!: any;
  valueE!: any;
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
    vars: 7,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4782264005467235841$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Span title {$interpolation} and {$interpolation_1}',
            { 'interpolation': '�0�', 'interpolation_1': '�1�' },
            {
              original_code: { 'interpolation': '{{ valueB }}', 'interpolation_1': '{{ valueC }}' },
            },
          );
        i18n_0 = MSG_EXTERNAL_4782264005467235841$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Span title ${'�0�'}:INTERPOLATION: and ${'�1�'}:INTERPOLATION_1:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2719594642740200058$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            'Span title {$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ valueE }}' } },
          );
        i18n_1 = MSG_EXTERNAL_2719594642740200058$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`Span title ${'�0�'}:INTERPOLATION:`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_789713089942130201$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            ' My i18n block #1 with value: {$interpolation} {$startTagSpan} Plain text in nested element (block #1) {$closeTagSpan}',
            { 'closeTagSpan': '�/#2�', 'interpolation': '�0�', 'startTagSpan': '�#2�' },
            {
              original_code: {
                'closeTagSpan': '</span>',
                'interpolation': '{{ valueA }}',
                'startTagSpan':
                  '<span i18n-title title="Span title {{ valueB }} and {{ valueC }}">',
              },
            },
          );
        i18n_2 = MSG_EXTERNAL_789713089942130201$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize` My i18n block #1 with value: ${'�0�'}:INTERPOLATION: ${'�#2�'}:START_TAG_SPAN: Plain text in nested element (block #1) ${'�/#2�'}:CLOSE_TAG_SPAN:`;
      }
      let i18n_3;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6932146024895341161$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            ' My i18n block #2 with value {$interpolation} {$startTagSpan} Plain text in nested element (block #2) {$closeTagSpan}',
            { 'closeTagSpan': '�/#7�', 'interpolation': '�0�', 'startTagSpan': '�#7�' },
            {
              original_code: {
                'closeTagSpan': '</span>',
                'interpolation': '{{ valueD | uppercase }}',
                'startTagSpan': '<span i18n-title title="Span title {{ valueE }}">',
              },
            },
          );
        i18n_3 = MSG_EXTERNAL_6932146024895341161$$_NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize` My i18n block #2 with value ${'�0�'}:INTERPOLATION: ${'�#7�'}:START_TAG_SPAN: Plain text in nested element (block #2) ${'�/#7�'}:CLOSE_TAG_SPAN:`;
      }
      return [i18n_2, i18n_3, ['title', i18n_0], ['title', i18n_1], [6, 'title']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementStart(2, 'span', 4);
        i0.ɵɵi18nAttributes(3, 2);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, 'div');
        i0.ɵɵi18nStart(5, 1);
        i0.ɵɵpipe(6, 'uppercase');
        i0.ɵɵelementStart(7, 'span', 4);
        i0.ɵɵi18nAttributes(8, 3);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.valueB)(ctx.valueC);
        i0.ɵɵi18nApply(3);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.valueA);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(ctx.valueE);
        i0.ɵɵi18nApply(8);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(6, 5, ctx.valueD));
        i0.ɵɵi18nApply(5);
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
      My i18n block #1 with value: {{ valueA }}
      <span i18n-title title="Span title {{ valueB }} and {{ valueC }}">
        Plain text in nested element (block #1)
      </span>
    </div>
    <div i18n>
      My i18n block #2 with value {{ valueD | uppercase }}
      <span i18n-title title="Span title {{ valueE }}">
        Plain text in nested element (block #2)
      </span>
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
      filePath: 'nested_elements_with_i18n_attributes.ts',
      lineNumber: 29,
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
    [typeof UppercasePipe, typeof MyComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [UppercasePipe, MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [UppercasePipe, MyComponent] });
})();

```