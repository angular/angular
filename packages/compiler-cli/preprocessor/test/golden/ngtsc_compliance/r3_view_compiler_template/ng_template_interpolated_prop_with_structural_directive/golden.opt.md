# /out/ng_template_interpolated_prop_with_structural_directive.ngtypecheck.ts
```ts
/**
 * TCB for /ng_template_interpolated_prop_with_structural_directive.ts
 * @generated
 */

import * as i0 from './ng_template_interpolated_prop_with_structural_directive';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
  }
}

```

# /out/ng_template_interpolated_prop_with_structural_directive.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestComp_0_ng_template_0_Template(rf: number, ctx: any): any {}
function TestComp_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtemplate(0, TestComp_0_ng_template_0_Template, 0, 0, 'ng-template', 1);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('dir', i0.ɵɵinterpolate(ctx_r0.message));
  }
}

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
    vars: 1,
    consts: [
      [4, 'ngIf'],
      [3, 'dir'],
    ],
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestComp_0_Template, 1, 2, null, 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', true);
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
                template: '<ng-template *ngIf="true" dir="{{ message }}"></ng-template>',
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
      filePath: 'ng_template_interpolated_prop_with_structural_directive.ts',
      lineNumber: 16,
    });
})();

```