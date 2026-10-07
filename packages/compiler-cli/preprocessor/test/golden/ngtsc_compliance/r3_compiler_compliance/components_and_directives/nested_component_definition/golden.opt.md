# /out/nested_component_definition.ngtypecheck.ts
```ts
/**
 * TCB for /nested_component_definition.ts
 * @generated
 */

import { Component } from '@angular/core';

@Component({
  template: 'outer',
})
class Outer {
  constructor() {
    @Component({
      template: 'inner',
    })
    class Inner {}

    /*tcb2*/
    function _tcb2(this: Inner) {
      if (true) {
      }
    }
  }
}

/*tcb1*/
function _tcb1(this: Outer) {
  if (true) {
  }
}

```

# /out/nested_component_definition.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Outer {
  constructor() {
    class Inner {
      // @ts-ignore
      static ɵfac: i0.ɵɵFactoryDeclaration<Inner, never> = function Inner_Factory(
        __ngFactoryType__: any,
      ): any {
        return new (__ngFactoryType__ || Inner)();
      };
      // @ts-ignore
      static ɵcmp: i0.ɵɵComponentDeclaration<
        Inner,
        'ng-component',
        never,
        {},
        {},
        never,
        never,
        true,
        never
      > = /*@__PURE__*/ i0.ɵɵdefineComponent({
        type: Inner,
        selectors: [['ng-component']],
        decls: 1,
        vars: 0,
        template: function Inner_Template(rf: number, ctx: any): any {
          if (rf & 1) {
            i0.ɵɵtext(0, 'inner');
          }
        },
        encapsulation: 2,
      });
      static {
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          i0.ɵsetClassMetadata(
            Inner,
            [
              {
                type: Component,
                args: [
                  {
                    template: 'inner',
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
        i0.ɵsetClassDebugInfo(Inner, {
          className: 'Inner',
          filePath: 'nested_component_definition.ts',
          lineNumber: 11,
        });
    })();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Outer, never> = function Outer_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Outer)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Outer,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Outer,
    selectors: [['ng-component']],
    decls: 1,
    vars: 0,
    template: function Outer_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'outer');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Outer,
        [
          {
            type: Component,
            args: [
              {
                template: 'outer',
              },
            ],
          },
        ],
        (): any => [],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Outer, {
      className: 'Outer',
      filePath: 'nested_component_definition.ts',
      lineNumber: 6,
    });
})();

```