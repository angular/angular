# /out/component.ngtypecheck.ts
```ts
/**
 * TCB for /component.ts
 * @generated
 */

import * as i0 from './component';

/*tcb1*/
function _tcb1(this: i0.OtherCmp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.SignalCmp) {
  if (true) {
  }
}

```

# /out/component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class OtherCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherCmp, never> = function OtherCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OtherCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OtherCmp,
    'other-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never,
    true
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherCmp,
    selectors: [['other-cmp']],
    signals: true,
    decls: 0,
    vars: 0,
    template: function OtherCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OtherCmp,
        [
          {
            type: Component,
            args: [
              {
                // @ts-ignore
                signals: true,
                selector: 'other-cmp',
                template: '',
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
    i0.ɵsetClassDebugInfo(OtherCmp, {
      className: 'OtherCmp',
      filePath: 'component.ts',
      lineNumber: 9,
    });
})();

export class SignalCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SignalCmp, never> = function SignalCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SignalCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SignalCmp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never,
    true
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SignalCmp,
    selectors: [['ng-component']],
    signals: true,
    decls: 1,
    vars: 0,
    template: function SignalCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'other-cmp');
      }
    },
    dependencies: [OtherCmp],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SignalCmp,
        [
          {
            type: Component,
            args: [
              {
                // @ts-ignore
                signals: true,
                template: '<other-cmp></other-cmp>',
                imports: [OtherCmp],
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
    i0.ɵsetClassDebugInfo(SignalCmp, {
      className: 'SignalCmp',
      filePath: 'component.ts',
      lineNumber: 18,
    });
})();

```