# /out/app.ts
```ts
import { Component, Input, input } from '@angular/core';
import { myBooleanTransform, externalToNumberTransform } from './transforms';
import { arrowTransform as aliasedTransform } from './transforms';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestTransformsComponent {
  decoratorInput!: boolean;
  aliasedInput!: unknown;

  signalInput = input(false, {
    ...(ngDevMode ? { debugName: 'signalInput' } : /* istanbul ignore next */ {}),
    transform: myBooleanTransform,
  });
  aliasedSignal = input(0, {
    ...(ngDevMode ? { debugName: 'aliasedSignal' } : /* istanbul ignore next */ {}),
    transform: aliasedTransform,
  });

  // Also test a regular inline transform
  inlineTransform!: string;

  // Test automatic import resolution for the external type
  externalTypeInput!: number;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestTransformsComponent, never> =
    function TestTransformsComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TestTransformsComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestTransformsComponent,
    'test-transforms',
    never,
    {
      'decoratorInput': { 'alias': 'decoratorInput'; 'required': false };
      'aliasedInput': { 'alias': 'aliasedInput'; 'required': false };
      'signalInput': { 'alias': 'signalInput'; 'required': false; 'isSignal': true };
      'aliasedSignal': { 'alias': 'aliasedSignal'; 'required': false; 'isSignal': true };
      'inlineTransform': { 'alias': 'inlineTransform'; 'required': false };
      'externalTypeInput': { 'alias': 'externalTypeInput'; 'required': false };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestTransformsComponent,
    selectors: [['test-transforms']],
    inputs: {
      decoratorInput: [2, 'decoratorInput', 'decoratorInput', myBooleanTransform],
      aliasedInput: [2, 'aliasedInput', 'aliasedInput', aliasedTransform],
      signalInput: [1, 'signalInput'],
      aliasedSignal: [1, 'aliasedSignal'],
      inlineTransform: [
        2,
        'inlineTransform',
        'inlineTransform',
        (v: string | null) => v || 'default',
      ],
      externalTypeInput: [2, 'externalTypeInput', 'externalTypeInput', externalToNumberTransform],
    },
    decls: 1,
    vars: 0,
    template: function TestTransformsComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
    },
    encapsulation: 2,
  });
  // @ts-ignore
  declare static ngAcceptInputType_decoratorInput: Parameters<typeof myBooleanTransform>[0];
  // @ts-ignore
  declare static ngAcceptInputType_aliasedInput: Parameters<typeof aliasedTransform>[0];
  // @ts-ignore
  declare static ngAcceptInputType_inlineTransform: string | null;
  // @ts-ignore
  declare static ngAcceptInputType_externalTypeInput: Parameters<
    typeof externalToNumberTransform
  >[0];
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestTransformsComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-transforms',
                standalone: true,
                template: `<div></div>`,
              },
            ],
          },
        ],
        null,
        {
          decoratorInput: [{ type: Input, args: [{ transform: myBooleanTransform }] }],
          aliasedInput: [{ type: Input, args: [{ transform: aliasedTransform }] }],
          inlineTransform: [
            { type: Input, args: [{ transform: (v: string | null) => v || 'default' }] },
          ],
          externalTypeInput: [{ type: Input, args: [{ transform: externalToNumberTransform }] }],
          signalInput: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'signalInput', required: false }] },
          ],
          aliasedSignal: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'aliasedSignal', required: false }] },
          ],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestTransformsComponent, {
      className: 'TestTransformsComponent',
      filePath: 'app.ts',
      lineNumber: 10,
    });
})();

export class AppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 1,
    vars: 6,
    consts: [
      [
        3,
        'decoratorInput',
        'aliasedInput',
        'signalInput',
        'aliasedSignal',
        'inlineTransform',
        'externalTypeInput',
      ],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'test-transforms', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('decoratorInput', 'true')('aliasedInput', 123)('signalInput', 'false')(
          'aliasedSignal',
          'hello',
        )('inlineTransform', null)('externalTypeInput', true);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [TestTransformsComponent]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                standalone: true,
                imports: [TestTransformsComponent],
                template: `
        <test-transforms
          [decoratorInput]="'true'"
          [aliasedInput]="123"
          [signalInput]="'false'"
          [aliasedSignal]="'hello'"
          [inlineTransform]="null"
          [externalTypeInput]="true"
        ></test-transforms>
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.ts',
      lineNumber: 39,
    });
})();

```