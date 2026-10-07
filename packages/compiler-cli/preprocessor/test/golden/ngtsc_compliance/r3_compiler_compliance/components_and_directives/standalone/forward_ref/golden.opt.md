# /out/forward_ref.ngtypecheck.ts
```ts
/**
 * TCB for /forward_ref.ts
 * @generated
 */

import * as i0 from './forward_ref';

/*tcb1*/
function _tcb1(this: i0.TestComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.StandaloneComponent) {
  if (true) {
  }
}

```

# /out/forward_ref.ts
```ts
import { Component, forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'test',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['test']],
    decls: 1,
    vars: 0,
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'other-standalone');
      }
    },
    dependencies: (): any => [StandaloneComponent],
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
                selector: 'test',
                imports: [forwardRef(() => StandaloneComponent)],
                template: '<other-standalone></other-standalone>',
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
      filePath: 'forward_ref.ts',
      lineNumber: 8,
    });
})();

export class StandaloneComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneComponent, never> =
    function StandaloneComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || StandaloneComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StandaloneComponent,
    'other-standalone',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneComponent,
    selectors: [['other-standalone']],
    decls: 0,
    vars: 0,
    template: function StandaloneComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'other-standalone',
                template: '',
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
    i0.ɵsetClassDebugInfo(StandaloneComponent, {
      className: 'StandaloneComponent',
      filePath: 'forward_ref.ts',
      lineNumber: 15,
    });
})();

```