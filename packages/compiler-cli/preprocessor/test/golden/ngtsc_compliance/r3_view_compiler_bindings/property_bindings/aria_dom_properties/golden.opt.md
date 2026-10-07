# /out/aria_dom_properties.ngtypecheck.ts
```ts
/**
 * TCB for /aria_dom_properties.ts
 * @generated
 */

import * as i0 from './aria_dom_properties';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.disabled /*102,110*/ /*102,110*/;
    this.readonly /*129,137*/ /*129,137*/;
    this.label /*152,157*/ /*152,157*/;
  }
}

```

# /out/aria_dom_properties.ts
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
    decls: 1,
    vars: 3,
    consts: [[3, 'ariaLabel']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'input', 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('ariaLabel', ctx.label);
        i0.ɵɵattribute('aria-disabled', ctx.disabled)('aria-readonly', ctx.readonly);
      }
    },
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
                template: `
        <input [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
      `,
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
      filePath: 'aria_dom_properties.ts',
      lineNumber: 8,
    });
})();

```