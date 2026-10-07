# /out/host_dollar_any.ngtypecheck.ts
```ts
/**
 * TCB for /host_dollar_any.ts
 * @generated
 */

import * as i0 from './host_dollar_any';

/*tcb1*/
function _tcb1(this: i0.HostBindingDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    'red' /*132,137*/ as any /*127,138*/;
  }
}

```

# /out/host_dollar_any.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never> = function HostBindingDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostBindingDir,
    '[hostBindingDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostBindingDir,
    selectors: [['', 'hostBindingDir', '']],
    hostVars: 2,
    hostBindings: function HostBindingDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('color', 'red');
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function HostBindingDir_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingDir,
        [
          {
            type: Component,
            args: [
              {
                selector: '[hostBindingDir]',
                host: {
                  '[style.color]': '$any("red")',
                },
                template: ``,
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
    i0.ɵsetClassDebugInfo(HostBindingDir, {
      className: 'HostBindingDir',
      filePath: 'host_dollar_any.ts',
      lineNumber: 11,
    });
})();

```