# /out/app.ts
```ts
import { Component } from '@angular/core';
import { BrokenType, BrokenDtsDirective } from './broken';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComp {
  item?: BrokenType;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComp, never> = function AppComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComp,
    'app-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComp,
    selectors: [['app-comp']],
    decls: 2,
    vars: 1,
    consts: [['broken-dir', '', 3, 'brokenInput']],
    template: function AppComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'DTS Tolerance');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('brokenInput', 'test');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComp, [BrokenDtsDirective]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-comp',
                template: '<div broken-dir [brokenInput]="\'test\'">DTS Tolerance</div>',
                imports: [BrokenDtsDirective],
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
    i0.ɵsetClassDebugInfo(AppComp, { className: 'AppComp', filePath: 'app.ts', lineNumber: 10 });
})();

```