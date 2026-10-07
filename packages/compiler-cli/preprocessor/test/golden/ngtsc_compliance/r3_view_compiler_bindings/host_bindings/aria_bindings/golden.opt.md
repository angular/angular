# /out/aria_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /aria_bindings.ts
 * @generated
 */

import * as i0 from './aria_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.disabled /*110,118*/ /*110,118*/;
    this.readonly /*145,153*/ /*145,153*/;
    this.label /*176,181*/ /*176,181*/;
  }
}

```

# /out/aria_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['ng-component']],
    hostVars: 3,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('ariaLabel', ctx.label);
        i0.ɵɵattribute('aria-disabled', ctx.disabled)('aria-readonly', ctx.readonly);
      }
    },
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                template: ``,
                host: {
                  '[attr.aria-disabled]': 'disabled',
                  '[aria-readonly]': 'readonly',
                  '[ariaLabel]': 'label',
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'aria_bindings.ts',
      lineNumber: 11,
    });
})();

```