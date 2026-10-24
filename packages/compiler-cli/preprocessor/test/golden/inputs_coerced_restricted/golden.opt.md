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
    _t1 /*1186,1201*/ = 'test' /*1204,1210*/; /*1185,1211*/
    var _t2 =
      null! as typeof i0.TestCoercedComponent.ngAcceptInputType_coercedByTransform; /*T:VAE*/
    _t2 /*1219,1237*/ = 'test' /*1240,1246*/; /*1218,1247*/
    var _t3 /*T:DIR:0*/ /*1165,1442*/ = null! as i0.TestCoercedComponent; /*T:VAE*/
    var _t4 = null! as (typeof _t3)['privateInput']; /*T:VAE*/
    null! as typeof _t3.privateInput; /*D:ignore*/ /*1255,1267*/
    _t4 /*1255,1267*/ = 'test' /*1270,1276*/; /*1254,1277*/
    var _t5 = null! as (typeof _t3)['protectedInput']; /*T:VAE*/
    null! as typeof _t3.protectedInput; /*D:ignore*/ /*1285,1299*/
    _t5 /*1285,1299*/ = 'test' /*1302,1308*/; /*1284,1309*/
    var _t6 = null! as (typeof _t3)['readonlyInput']; /*T:VAE*/
    null! as typeof _t3.readonlyInput; /*D:ignore*/ /*1317,1330*/
    _t6 /*1317,1330*/ = 'test' /*1333,1339*/; /*1316,1340*/
    _t3['literalInput'] /*1348,1360*/ = 'test' /*1363,1369*/; /*1347,1370*/
    _t3.signalWithTransform[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*1378,1397*/ =
      'test' /*1400,1406*/; /*1377,1407*/
    _t3.normalInput /*1415,1426*/ = 'test' /*1429,1435*/; /*1414,1436*/
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
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
          signalWithTransform: [
            {
              type: i0.Input,
              args: [{ isSignal: true, alias: 'signalWithTransform', required: false }],
            },
          ],
          normalInput: [{ type: Input }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCoercedComponent, {
      className: 'TestCoercedComponent',
      filePath: 'app.ts',
      lineNumber: 7,
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
      lineNumber: 50,
    });
})();

```