# /out/conditional_same_component_names.ngtypecheck.ts
```ts
/**
 * TCB for /conditional_same_component_names.ts
 * @generated
 */

import { Component } from '@angular/core';

function it(_desc: string, fn: () => void) {}

it('case 1', () => {
  @Component({
    template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
    standalone: false,
  })
  class TestComponent {}

  /*tcb1*/
  function _tcb1(this: TestComponent) {
    if (true) {
      if (true /*152,156*/) {
      } else {
      }
    }
  }
});

it('case 2', () => {
  @Component({
    template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
    standalone: false,
  })
  class TestComponent {}

  /*tcb2*/
  function _tcb2(this: TestComponent) {
    if (true) {
      if (true /*341,345*/) {
      } else {
      }
    }
  }
});

```

# /out/conditional_same_component_names.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestComponent_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' First ');
  }
}
function TestComponent_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Second ');
  }
}
function TestComponent_Conditional_0_Template1(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' First ');
  }
}
function TestComponent_Conditional_1_Template1(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Second ');
  }
}

function it(_desc: string, fn: () => void) {}

it('case 1', () => {
  class TestComponent {
    // @ts-ignore
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
      __ngFactoryType__: any,
    ): any {
      return new (__ngFactoryType__ || TestComponent)();
    };
    // @ts-ignore
    static ɵcmp: i0.ɵɵComponentDeclaration<
      TestComponent,
      'ng-component',
      never,
      {},
      {},
      never,
      never,
      false,
      never
    > = /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TestComponent,
      selectors: [['ng-component']],
      standalone: false,
      decls: 2,
      vars: 1,
      template: function TestComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵconditionalCreate(0, TestComponent_Conditional_0_Template, 1, 0)(
            1,
            TestComponent_Conditional_1_Template,
            1,
            0,
          );
        }
        if (rf & 2) {
          i0.ɵɵconditional(true ? 0 : 1);
        }
      },
      encapsulation: 2,
    });
    static {
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
        i0.ɵsetClassMetadata(
          TestComponent,
          [
            {
              type: Component,
              args: [
                {
                  template: `
          @if (true) {
            First
          } @else {
            Second
          }
        `,
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
      i0.ɵsetClassDebugInfo(TestComponent, {
        className: 'TestComponent',
        filePath: 'conditional_same_component_names.ts',
        lineNumber: 16,
      });
  })();
});

it('case 2', () => {
  class TestComponent {
    // @ts-ignore
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
      __ngFactoryType__: any,
    ): any {
      return new (__ngFactoryType__ || TestComponent)();
    };
    // @ts-ignore
    static ɵcmp: i0.ɵɵComponentDeclaration<
      TestComponent,
      'ng-component',
      never,
      {},
      {},
      never,
      never,
      false,
      never
    > = /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TestComponent,
      selectors: [['ng-component']],
      standalone: false,
      decls: 2,
      vars: 1,
      template: function TestComponent_Template1(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵconditionalCreate(0, TestComponent_Conditional_0_Template1, 1, 0)(
            1,
            TestComponent_Conditional_1_Template1,
            1,
            0,
          );
        }
        if (rf & 2) {
          i0.ɵɵconditional(true ? 0 : 1);
        }
      },
      encapsulation: 2,
    });
    static {
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
        i0.ɵsetClassMetadata(
          TestComponent,
          [
            {
              type: Component,
              args: [
                {
                  template: `
          @if (true) {
            First
          } @else {
            Second
          }
        `,
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
      i0.ɵsetClassDebugInfo(TestComponent, {
        className: 'TestComponent',
        filePath: 'conditional_same_component_names.ts',
        lineNumber: 31,
      });
  })();
});

```