# /out/ng_template_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /ng_template_bindings.ts
 * @generated
 */

import * as i0 from './ng_template_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/ng_template_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {}

export class MyComponent {
  p1!: any;
  a1!: any;
  c1!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    decls: 1,
    vars: 3,
    consts: [['l', 'l1', 3, 'p', 'a', 'c']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_ng_template_0_Template, 0, 0, 'ng-template', 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('p', ctx.p1)('a', ctx.a1)('c', ctx.c1);
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
                selector: 'my-component',
                template:
                  '<ng-template l="l1" [p]="p1" [attr.a]="a1" [class.c]="c1"></ng-template>',
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
      filePath: 'ng_template_bindings.ts',
      lineNumber: 7,
    });
})();

```