# /out/host_class_binding_special_chars.ngtypecheck.ts
```ts
/**
 * TCB for /host_class_binding_special_chars.ts
 * @generated
 */

import * as i0 from './host_class_binding_special_chars';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.expr /*113,117*/ /*113,117*/;
    this.expr /*166,170*/ /*166,170*/;
    this.expr /*213,217*/ /*213,217*/;
  }
}

```

# /out/host_class_binding_special_chars.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  expr = true;
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
    hostVars: 6,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵclassProp('text-primary/80', ctx.expr)('data-active:text-green-300/80', ctx.expr)(
          "data-[size='large']:p-8",
          ctx.expr,
        );
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
                  '[class.text-primary/80]': 'expr',
                  '[class.data-active:text-green-300/80]': 'expr',
                  "[class.data-[size='large']:p-8]": 'expr',
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
      filePath: 'host_class_binding_special_chars.ts',
      lineNumber: 11,
    });
})();

```