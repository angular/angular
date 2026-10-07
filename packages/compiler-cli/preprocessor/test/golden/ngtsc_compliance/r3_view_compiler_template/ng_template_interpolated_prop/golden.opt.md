# /out/ng_template_interpolated_prop.ngtypecheck.ts
```ts
/**
 * TCB for /ng_template_interpolated_prop.ts
 * @generated
 */

import * as i0 from './ng_template_interpolated_prop';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
  }
}

```

# /out/ng_template_interpolated_prop.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestComp_ng_template_0_Template(rf: number, ctx: any): any {}

class WithInput {
  dir: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<WithInput, never> = function WithInput_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || WithInput)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    WithInput,
    '[dir]',
    never,
    { 'dir': { 'alias': 'dir'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: WithInput,
    selectors: [['', 'dir', '']],
    inputs: { dir: 'dir' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        WithInput,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { dir: [{ type: Input }] },
      );
  }
}

export class TestComp {
  message = 'Hello';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 2,
    consts: [[3, 'dir']],
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestComp_ng_template_0_Template, 0, 0, 'ng-template', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('dir', i0.ɵɵinterpolate(ctx.message));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: '<ng-template dir="{{ message }}"></ng-template>',
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'ng_template_interpolated_prop.ts',
      lineNumber: 16,
    });
})();

```