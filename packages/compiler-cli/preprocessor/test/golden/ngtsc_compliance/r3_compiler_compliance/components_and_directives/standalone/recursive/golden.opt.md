# /out/recursive.ngtypecheck.ts
```ts
/**
 * TCB for /recursive.ts
 * @generated
 */

import * as i0 from './recursive';

/*tcb1*/
function _tcb1(this: i0.RecursiveComponent) {
  if (true) {
  }
}

```

# /out/recursive.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class RecursiveComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RecursiveComponent, never> =
    function RecursiveComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || RecursiveComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    RecursiveComponent,
    'recursive-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: RecursiveComponent,
    selectors: [['recursive-cmp']],
    decls: 1,
    vars: 0,
    template: function RecursiveComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'recursive-cmp');
      }
    },
    dependencies: [RecursiveComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RecursiveComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'recursive-cmp',
                // Simple recursion. Note: no `imports`.
                template: '<recursive-cmp></recursive-cmp>',
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
    i0.ɵsetClassDebugInfo(RecursiveComponent, {
      className: 'RecursiveComponent',
      filePath: 'recursive.ts',
      lineNumber: 8,
    });
})();

```