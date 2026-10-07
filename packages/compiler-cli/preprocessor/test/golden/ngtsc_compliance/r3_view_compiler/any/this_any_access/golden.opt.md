# /out/this_any_access.ngtypecheck.ts
```ts
/**
 * TCB for /this_any_access.ts
 * @generated
 */

import { Component } from '@angular/core';

@Component({
  template: '<div [tabIndex]="this.$any(null)"></div>',
  standalone: false,
})
class Comp {
  $any(value: null): any {
    return value as any;
  }
}

/*tcb1*/
function _tcb1(this: Comp) {
  if (true) {
    this.$any(/*92,96*/ null /*97,101*/) /*87,102*/;
  }
}

```

# /out/this_any_access.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Comp {
  $any(value: null): any {
    return value as any;
  }
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
        i0.ɵɵproperty('tabIndex', ctx.$any(null));
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
                template: '<div [tabIndex]="this.$any(null)"></div>',
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
      filePath: 'this_any_access.ts',
      lineNumber: 7,
    });
})();

```