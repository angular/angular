# /out/test.component.ngtypecheck.ts
```ts
/**
 * TCB for /test.component.ts
 * @generated
 */

import * as i0 from './test.component';

/*tcb1*/
function _tcb1(this: i0.TestComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.isActive /*427,441*/ /*427,441*/;
    var _t1 = document.createElement('test-cmp'); /*176,189*/
    _t1.addEventListener(/*479,488*/ 'keydown', ($event /*T:EP*/): any => {
      this
        .onKeyDown /*492,501*/
        () /*492,501*/;
    }) /*465,489*/;
  }
}

```

# /out/test.component.ts
```ts
import { Component, HostBinding, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComponent {
  @HostBinding('class')
  static readonly className = 'themeable';

  @HostBinding('attr.aria-hidden')
  static get isHidden(): boolean {
    return true;
  }

  @HostListener('click')
  static onStaticClick(): void {}

  isActive = true;

  onKeyDown(): void {}
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
    hostVars: 2,
    hostBindings: function TestComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('keydown', function TestComponent_keydown_HostBindingHandler(): any {
          return ctx.onKeyDown();
        });
      }
      if (rf & 2) {
        i0.ɵɵclassProp('active', ctx.isActive);
      }
    },
    decls: 2,
    vars: 0,
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵdomElementEnd();
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
                standalone: true,
                template: '<div>Hello</div>',
              },
            ],
          },
        ],
        null,
        {
          isActive: [{ type: HostBinding, args: ['class.active'] }],
          onKeyDown: [{ type: HostListener, args: ['keydown'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'test.component.ts',
      lineNumber: 8,
    });
})();

```