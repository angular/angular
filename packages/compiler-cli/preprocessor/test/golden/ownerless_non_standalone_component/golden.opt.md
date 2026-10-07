# /out/ownerless.component.ngtypecheck.ts
```ts
/**
 * TCB for /ownerless.component.ts
 * @generated
 */

import * as i0 from './ownerless.component';

/*tcb1*/
function _tcb1(this: i0.OwnerlessComponent) {
  if (true) {
  }
}

```

# /out/ownerless.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// A non-standalone component that is not declared by any NgModule in the program.
// The compiler must still EMIT its definition (matching ngtsc) rather than aborting
// the compilation — see fix(compiler): emit ownerless non-standalone components.
// This case must keep producing output in optimize mode, so golden.opt.md guards it.
export class OwnerlessComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OwnerlessComponent, never> =
    function OwnerlessComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || OwnerlessComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OwnerlessComponent,
    'app-ownerless',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OwnerlessComponent,
    selectors: [['app-ownerless']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function OwnerlessComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Ownerless');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OwnerlessComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-ownerless',
                template: '<div>Ownerless</div>',
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
    i0.ɵsetClassDebugInfo(OwnerlessComponent, {
      className: 'OwnerlessComponent',
      filePath: 'ownerless.component.ts',
      lineNumber: 12,
    });
})();

```