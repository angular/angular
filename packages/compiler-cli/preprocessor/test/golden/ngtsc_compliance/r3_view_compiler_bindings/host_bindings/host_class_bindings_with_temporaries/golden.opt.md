# /out/host_class_bindings_with_temporaries.ngtypecheck.ts
```ts
/**
 * TCB for /host_class_bindings_with_temporaries.ts
 * @generated
 */

import * as i0 from './host_class_bindings_with_temporaries';

/*tcb1*/
function _tcb1(this: i0.HostBindingDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.value /*115,120*/ /*115,120*/ ?? 'class-a' /*124,133*/ /*115,133*/;
    this.value /*154,159*/ /*154,159*/ ?? 'class-b' /*163,172*/ /*154,172*/;
  }
}

```

# /out/host_class_bindings_with_temporaries.ts
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
        i0.ɵɵclassProp('a', ctx.value ?? 'class-a')('b', ctx.value ?? 'class-b');
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
                  '[class.a]': 'value ?? "class-a"',
                  '[class.b]': 'value ?? "class-b"',
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