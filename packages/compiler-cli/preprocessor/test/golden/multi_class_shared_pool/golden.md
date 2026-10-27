# /out/app.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 =
  '.shared-box[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; }';

export class FirstComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FirstComp, never> = function FirstComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FirstComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FirstComp,
    'first-comp',
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
      type: FirstComp,
      selectors: [['first-comp']],
      decls: 2,
      vars: 0,
      consts: [[1, 'shared-box']],
      template: function FirstComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div', 0);
          i0.ɵɵtext(1, 'First');
          i0.ɵɵelementEnd();
        }
      },
      styles: [_c0],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FirstComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'first-comp',
                template: '<div class="shared-box">First</div>',
                styles: [
                  '.shared-box { display: flex; align-items: center; justify-content: space-between; }',
                ],
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
    i0.ɵsetClassDebugInfo(FirstComp, { className: 'FirstComp', filePath: 'app.ts', lineNumber: 8 });
})();

export class SecondComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SecondComp, never> = function SecondComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SecondComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SecondComp,
    'second-comp',
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
      type: SecondComp,
      selectors: [['second-comp']],
      decls: 2,
      vars: 0,
      consts: [[1, 'shared-box']],
      template: function SecondComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div', 0);
          i0.ɵɵtext(1, 'Second');
          i0.ɵɵelementEnd();
        }
      },
      styles: [_c0],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SecondComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'second-comp',
                template: '<div class="shared-box">Second</div>',
                styles: [
                  '.shared-box { display: flex; align-items: center; justify-content: space-between; }',
                ],
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
    i0.ɵsetClassDebugInfo(SecondComp, {
      className: 'SecondComp',
      filePath: 'app.ts',
      lineNumber: 15,
    });
})();

```