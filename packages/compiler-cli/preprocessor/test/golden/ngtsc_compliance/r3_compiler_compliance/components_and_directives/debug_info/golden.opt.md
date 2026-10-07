# /out/debug_info.ngtypecheck.ts
```ts
/**
 * TCB for /debug_info.ts
 * @generated
 */

import * as i0 from './debug_info';

/*tcb1*/
function _tcb1(this: i0.Main) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MainStandalone) {
  if (true) {
  }
}

```

# /out/debug_info.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Main {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Main, never> = function Main_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Main)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Main,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Main,
    selectors: [['ng-component']],
    decls: 1,
    vars: 0,
    template: function Main_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Hello Angular!');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Main,
        [
          {
            type: Component,
            args: [
              {
                template: 'Hello Angular!',
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
    i0.ɵsetClassDebugInfo(Main, { className: 'Main', filePath: 'debug_info.ts', lineNumber: 6 });
})();

export class MainStandalone {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MainStandalone, never> = function MainStandalone_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MainStandalone)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MainStandalone,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MainStandalone,
    selectors: [['ng-component']],
    decls: 1,
    vars: 0,
    template: function MainStandalone_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Hello Angular!');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MainStandalone,
        [
          {
            type: Component,
            args: [
              {
                template: 'Hello Angular!',
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
    i0.ɵsetClassDebugInfo(MainStandalone, {
      className: 'MainStandalone',
      filePath: 'debug_info.ts',
      lineNumber: 12,
    });
})();

```