# /out/host_animate_enter.ngtypecheck.ts
```ts
/**
 * TCB for /host_animate_enter.ts
 * @generated
 */

import * as i0 from './host_animate_enter';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.disabled /*129,137*/ /*129,137*/
      ? undefined /*140,149*/
      : 'enter-class' /*152,165*/ /*129,165*/;
  }
}

```

# /out/host_animate_enter.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  disabled = false;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    hostBindings: function TestCmp_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵanimateEnter(function TestCmp_HostBindings_animateenter_cb(): any {
          return ctx.disabled ? undefined : 'enter-class';
        });
      }
    },
    decls: 0,
    vars: 0,
    template: function TestCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template: '',
                host: {
                  '[animate.enter]': "disabled ? undefined : 'enter-class'",
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'host_animate_enter.ts',
      lineNumber: 10,
    });
})();

```