# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class PreserveWsCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PreserveWsCmp, never> = function PreserveWsCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PreserveWsCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    PreserveWsCmp,
    'preserve-ws-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: PreserveWsCmp,
    selectors: [['preserve-ws-cmp']],
    decls: 2,
    vars: 0,
    template: function PreserveWsCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, '  \n  Preserved  \n  ');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PreserveWsCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'preserve-ws-cmp',
                template: '<div>  \n  Preserved  \n  </div>',
                preserveWhitespaces: true,
                standalone: true,
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
    i0.ɵsetClassDebugInfo(PreserveWsCmp, {
      className: 'PreserveWsCmp',
      filePath: 'app.component.ts',
      lineNumber: 9,
    });
})();

export class NoPreserveWsCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NoPreserveWsCmp, never> = function NoPreserveWsCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NoPreserveWsCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NoPreserveWsCmp,
    'no-preserve-ws-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NoPreserveWsCmp,
    selectors: [['no-preserve-ws-cmp']],
    decls: 2,
    vars: 0,
    template: function NoPreserveWsCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, ' Not Preserved ');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NoPreserveWsCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'no-preserve-ws-cmp',
                template: '<div>  \n  Not Preserved  \n  </div>',
                preserveWhitespaces: false,
                standalone: true,
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
    i0.ɵsetClassDebugInfo(NoPreserveWsCmp, {
      className: 'NoPreserveWsCmp',
      filePath: 'app.component.ts',
      lineNumber: 17,
    });
})();

```