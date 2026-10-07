# /out/host_style_bindings_with_temporaries.ngtypecheck.ts
```ts
/**
 * TCB for /host_style_bindings_with_temporaries.ts
 * @generated
 */

import * as i0 from './host_style_bindings_with_temporaries';

/*tcb1*/
function _tcb1(this: i0.HostBindingDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.value /*122,127*/ /*122,127*/ ?? '15px' /*131,137*/ /*122,137*/;
    this.value /*167,172*/ /*167,172*/ ?? 'bold' /*176,182*/ /*167,182*/;
  }
}

```

# /out/host_style_bindings_with_temporaries.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingDir {
  value: number | null = null;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never> = function HostBindingDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingDir,
    '[hostBindingDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir,
    selectors: [['', 'hostBindingDir', '']],
    hostVars: 4,
    hostBindings: function HostBindingDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('font-size', ctx.value ?? '15px')('font-weight', ctx.value ?? 'bold');
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[hostBindingDir]',
                host: {
                  '[style.fontSize]': 'value ?? "15px"',
                  '[style.fontWeight]': 'value ?? "bold"',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```