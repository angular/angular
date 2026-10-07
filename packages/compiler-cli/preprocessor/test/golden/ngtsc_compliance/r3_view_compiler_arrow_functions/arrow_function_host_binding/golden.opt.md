# /out/arrow_function_host_binding.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_host_binding.ts
 * @generated
 */

import * as i0 from './arrow_function_host_binding';

/*tcb1*/
function _tcb1(this: i0.TestDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    (
      (a /*D:ignore*/, b /*D:ignore*/) => a /*102,103*/ / b /*106,107*/ /*102,107*/
    )(5 /*109,110*/, 10 /*112,114*/); /*91,115*/
    (
      (a /*D:ignore*/, b /*D:ignore*/) =>
        a /*157,158*/ / b /*161,162*/ /*157,162*/ +
        this.componentProp /*165,178*/ /*165,178*/ /*157,178*/
    )(6 /*180,181*/, 12 /*183,185*/); /*146,186*/
  }
}

```

# /out/arrow_function_host_binding.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any, b: any): any =>
    a / b;
const arrowFn1 =
  (ctx: any, view: any): any =>
  (a: any, b: any): any =>
    a / b + ctx.componentProp;

export class TestDir {
  componentProp = 1;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never> = function TestDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: TestDir,
      hostVars: 4,
      hostBindings: function TestDir_HostBindings(rf: number, ctx: any): any {
        if (rf & 2) {
          i0.ɵɵattribute('no-context', i0.ɵɵarrowFunction(2, arrowFn0, ctx)(5, 10))(
            'with-context',
            i0.ɵɵarrowFunction(3, arrowFn1, ctx)(6, 12),
          );
        }
      },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestDir,
        [
          {
            type: Directive,
            args: [
              {
                host: {
                  '[attr.no-context]': '((a, b) => a / b)(5, 10)',
                  '[attr.with-context]': '((a, b) => a / b + componentProp)(6, 12)',
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