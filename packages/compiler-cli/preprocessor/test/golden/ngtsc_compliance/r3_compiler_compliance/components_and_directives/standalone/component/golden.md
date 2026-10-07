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
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherCmp,
    selectors: [['other-cmp']],
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
      lineNumber: 7,
    });
})();

export class StandaloneCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneCmp, never> = function StandaloneCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StandaloneCmp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneCmp,
    selectors: [['ng-component']],
    decls: 1,
    vars: 0,
    template: function StandaloneCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'other-cmp');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(StandaloneCmp, [OtherCmp]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneCmp,
        [
          {
            type: Component,
            args: [
              {
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
    i0.ɵsetClassDebugInfo(StandaloneCmp, {
      className: 'StandaloneCmp',
      filePath: 'component.ts',
      lineNumber: 14,
    });
})();

```