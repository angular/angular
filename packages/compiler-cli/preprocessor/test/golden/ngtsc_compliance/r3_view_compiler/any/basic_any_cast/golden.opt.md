# /out/basic_any_cast.ngtypecheck.ts
```ts
/**
 * TCB for /basic_any_cast.ts
 * @generated
 */

import { Component } from '@angular/core';

@Component({
  template: '<div [tabIndex]="$any(10)"></div>',
  standalone: false,
})
class Comp {}

/*tcb1*/
function _tcb1(this: Comp) {
  if (true) {
    10 /*92,94*/ as any /*87,95*/;
  }
}

```

# /out/basic_any_cast.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Comp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Comp, never> = function Comp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Comp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Comp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, 'tabIndex']],
    template: function Comp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('tabIndex', 10);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Comp,
        [
          {
            type: Component,
            args: [
              {
                template: '<div [tabIndex]="$any(10)"></div>',
                standalone: false,
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
    i0.ɵsetClassDebugInfo(Comp, {
      className: 'Comp',
      filePath: 'basic_any_cast.ts',
      lineNumber: 7,
    });
})();

```