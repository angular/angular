# /out/app.component.ts
```ts
import { Component, ViewEncapsulation as VE, ChangeDetectionStrategy as CD } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AliasedCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AliasedCmp, never> = function AliasedCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AliasedCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AliasedCmp,
    'aliased-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AliasedCmp,
    selectors: [['aliased-cmp']],
    decls: 2,
    vars: 0,
    template: function AliasedCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Aliased');
        i0.ɵɵelementEnd();
      }
    },
    styles: ['div[_ngcontent-%COMP%] { color: red; }'],
    changeDetection: CD.Default,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AliasedCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'aliased-cmp',
                template: '<div>Aliased</div>',
                encapsulation: VE.None,
                changeDetection: CD.Default,
                styles: ['div { color: red; }'],
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
    i0.ɵsetClassDebugInfo(AliasedCmp, {
      className: 'AliasedCmp',
      filePath: 'app.component.ts',
      lineNumber: 14,
    });
})();

```