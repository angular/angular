# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TestCoercedComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.AppComponent) {
  if (true) {
    var _t1 = null! as typeof i0.TestCoercedComponent.ngAcceptInputType_coercedByStatic; /*T:VAE*/
    _t1 /*1226,1241*/ = 'test' /*1244,1250*/ /*1225,1251*/;
    var _t2 = null! as string | null; /*T:VAE*/
    _t2 /*1259,1277*/ = 'test' /*1280,1286*/ /*1258,1287*/;
    var _t3 /*T:DIR:0*/ /*1205,1482*/ = null! as i0.TestCoercedComponent; /*T:VAE*/
    var _t4 = null! as (typeof _t3)['privateInput']; /*T:VAE*/
    _t4 /*1295,1307*/ = 'test' /*1310,1316*/ /*1294,1317*/;
    var _t5 = null! as (typeof _t3)['protectedInput']; /*T:VAE*/
    _t5 /*1325,1339*/ = 'test' /*1342,1348*/ /*1324,1349*/;
    var _t6 = null! as (typeof _t3)['readonlyInput']; /*T:VAE*/
    _t6 /*1357,1370*/ = 'test' /*1373,1379*/ /*1356,1380*/;
    _t3['literalInput'] /*1388,1400*/ = 'test' /*1403,1409*/ /*1387,1410*/;
    _t3.signalWithTransform[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*1418,1437*/ =
      'test' /*1440,1446*/ /*1417,1447*/;
    _t3.normalInput /*1455,1466*/ = 'test' /*1469,1475*/ /*1454,1476*/;
  }
}

```

# /out/app.ts
```ts
import { Component, Input, input, booleanAttribute } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCoercedComponent {
  /** Should be coerced because of ngAcceptInputType_ */
  coercedByStatic!: string;
  static ngAcceptInputType_coercedByStatic: string | boolean;

  /** Should be coerced because of transform */
  coercedByTransform!: string;

  /** Should be restricted because of private */
  private privateInput!: string;

  /** Should be restricted because of protected */
  protected protectedInput!: string;

  /** Should be restricted because of readonly */
  readonly readonlyInput!: string;

  /** Should be string literal because of string literal key */
  'literalInput'!: string;

  /** Signal input with transform - should be coerced */
  signalWithTransform = input(false, {
    ...(ngDevMode ? { debugName: 'signalWithTransform' } : /* istanbul ignore next */ {}),
    transform: booleanAttribute,
  });

  // Testing a normal input that is just normal
  normalInput!: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCoercedComponent, never> =
    function TestCoercedComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TestCoercedComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCoercedComponent,
    'test-coerced',
    never,
    {
      'coercedByStatic': { 'alias': 'coercedByStatic'; 'required': false };
      'coercedByTransform': { 'alias': 'coercedByTransform'; 'required': false };
      'privateInput': { 'alias': 'privateInput'; 'required': false };
      'protectedInput': { 'alias': 'protectedInput'; 'required': false };
      'readonlyInput': { 'alias': 'readonlyInput'; 'required': false };
      'literalInput': { 'alias': 'literalInput'; 'required': false };
      'signalWithTransform': {
        'alias': 'signalWithTransform';
        'required': false;
        'isSignal': true;
      };
      'normalInput': { 'alias': 'normalInput'; 'required': false };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCoercedComponent,
    selectors: [['test-coerced']],
    inputs: {
      coercedByStatic: 'coercedByStatic',
      coercedByTransform: [
        2,
        'coercedByTransform',
        'coercedByTransform',
        (v: string | null) => v || 'default',
      ],
      privateInput: 'privateInput',
      protectedInput: 'protectedInput',
      readonlyInput: 'readonlyInput',
      literalInput: 'literalInput',
      signalWithTransform: [1, 'signalWithTransform'],
      normalInput: 'normalInput',
    },
    decls: 1,
    vars: 0,
    template: function TestCoercedComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div');
      }
    },
    encapsulation: 2,
  });
  // @ts-ignore
  declare static ngAcceptInputType_coercedByTransform: string | null;
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCoercedComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-coerced',
                standalone: true,
                template: `<div></div>`,
              },
            ],
          },
        ],
        null,
        {
          coercedByStatic: [{ type: Input }],
          coercedByTransform: [
            { type: Input, args: [{ transform: (v: string | null) => v || 'default' }] },
          ],
          privateInput: [{ type: Input }],
          protectedInput: [{ type: Input }],
          readonlyInput: [{ type: Input }],
          'literalInput': [{ type: Input }],
          normalInput: [{ type: Input }],
          signalWithTransform: [
            {
              type: i0.Input,
              args: [{ isSignal: true, alias: 'signalWithTransform', required: false }],
            },
          ],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCoercedComponent, {
      className: 'TestCoercedComponent',
      filePath: 'app.ts',
      lineNumber: 8,
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
    vars: 8,
    consts: [
      [
        3,
        'coercedByStatic',
        'coercedByTransform',
        'privateInput',
        'protectedInput',
        'readonlyInput',
        'literalInput',
        'signalWithTransform',
        'normalInput',
      ],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'test-coerced', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('coercedByStatic', 'test')('coercedByTransform', 'test')(
          'privateInput',
          'test',
        )('protectedInput', 'test')('readonlyInput', 'test')('literalInput', 'test')(
          'signalWithTransform',
          'test',
        )('normalInput', 'test');
      }
    },
    dependencies: [TestCoercedComponent],
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
                imports: [TestCoercedComponent],
                template: `
        <test-coerced
          [coercedByStatic]="'test'"
          [coercedByTransform]="'test'"
          [privateInput]="'test'"
          [protectedInput]="'test'"
          [readonlyInput]="'test'"
          [literalInput]="'test'"
          [signalWithTransform]="'test'"
          [normalInput]="'test'"
        ></test-coerced>
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
      lineNumber: 52,
    });
})();

```