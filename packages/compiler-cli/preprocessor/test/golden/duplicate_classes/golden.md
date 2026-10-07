# /out/app.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export function runTest() {
  class TestComponent {
    foo: string = '';
    // @ts-ignore
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
      __ngFactoryType__: any,
    ): any {
      return new (__ngFactoryType__ || TestComponent)();
    };
    // @ts-ignore
    static ɵcmp: i0.ɵɵComponentDeclaration<
      TestComponent,
      'test-cmp',
      never,
      {},
      {},
      never,
      never,
      true,
      never
    > = /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TestComponent,
      selectors: [['test-cmp']],
      decls: 2,
      vars: 0,
      template: function TestComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div');
          i0.ɵɵtext(1, 'Class 1');
          i0.ɵɵelementEnd();
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
                  selector: 'test-cmp',
                  template: `<div>Class 1</div>`,
                  standalone: true,
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
        filePath: 'app.ts',
        lineNumber: 9,
      });
  })();
}

export function runTest2() {
  class TestComponent {
    foo: string = '';
    // @ts-ignore
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
      __ngFactoryType__: any,
    ): any {
      return new (__ngFactoryType__ || TestComponent)();
    };
    // @ts-ignore
    static ɵcmp: i0.ɵɵComponentDeclaration<
      TestComponent,
      'test-cmp',
      never,
      {},
      {},
      never,
      never,
      true,
      never
    > = /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TestComponent,
      selectors: [['test-cmp']],
      decls: 2,
      vars: 0,
      template: function TestComponent_Template1(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div');
          i0.ɵɵtext(1, 'Class 1');
          i0.ɵɵelementEnd();
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
                  selector: 'test-cmp',
                  template: `<div>Class 1</div>`,
                  standalone: true,
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
        filePath: 'app.ts',
        lineNumber: 20,
      });
  })();
}

```