# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TestTransformsComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.AppComponent) {
  if (true) {
    var _t1 = null! as typeof i0.TestTransformsComponent.ngAcceptInputType_decoratorInput; /*T:VAE*/
    _t1 /*952,966*/ = 'true' /*969,975*/; /*951,976*/
    var _t2 = null! as typeof i0.TestTransformsComponent.ngAcceptInputType_aliasedInput; /*T:VAE*/
    _t2 /*984,996*/ = 123 /*999,1002*/; /*983,1003*/
    var _t3 /*T:DIR:0*/ /*928,1135*/ = null! as i0.TestTransformsComponent; /*T:VAE*/
    _t3.signalInput[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*1011,1022*/ =
      'false' /*1025,1032*/; /*1010,1033*/
    _t3.aliasedSignal[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*1041,1054*/ =
      'hello' /*1057,1064*/; /*1040,1065*/
    var _t4 =
      null! as typeof i0.TestTransformsComponent.ngAcceptInputType_inlineTransform; /*T:VAE*/
    _t4 /*1073,1088*/ = null /*1091,1095*/; /*1072,1096*/
    var _t5 =
      null! as typeof i0.TestTransformsComponent.ngAcceptInputType_externalTypeInput; /*T:VAE*/
    _t5 /*1104,1121*/ = true /*1124,1128*/; /*1103,1129*/
  }
}

```

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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
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
          i0.ɵɵdomElement(0, 'div');
        }
      },
      encapsulation: 2,
    });
  // @ts-ignore
  declare static ngAcceptInputType_decoratorInput: Parameters<typeof myBooleanTransform>[0];
  // @ts-ignore
  declare static ngAcceptInputType_aliasedInput: unknown;
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
                template: `<div></div>`,
              },
            ],
          },
        ],
        null,
        {
          decoratorInput: [{ type: Input, args: [{ transform: myBooleanTransform }] }],
          aliasedInput: [{ type: Input, args: [{ transform: aliasedTransform }] }],
          signalInput: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'signalInput', required: false }] },
          ],
          aliasedSignal: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'aliasedSignal', required: false }] },
          ],
          inlineTransform: [
            { type: Input, args: [{ transform: (v: string | null) => v || 'default' }] },
          ],
          externalTypeInput: [{ type: Input, args: [{ transform: externalToNumberTransform }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestTransformsComponent, {
      className: 'TestTransformsComponent',
      filePath: 'app.ts',
      lineNumber: 9,
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
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
      dependencies: [TestTransformsComponent],
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
      lineNumber: 37,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app.ts",
      "category": "error",
      "code": 1010,
      "messageText": "Input transform must be a function\n  Value could not be determined statically.",
      "span": {
        "start": 399,
        "end": 415
      }
    }
  ]
}

```