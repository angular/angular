# /out/class_binding_special_chars.ngtypecheck.ts
```ts
/**
 * TCB for /class_binding_special_chars.ts
 * @generated
 */

import * as i0 from './class_binding_special_chars';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.expr /*103,107*/ /*103,107*/;
    this.expr /*154,158*/ /*154,158*/;
    this.expr /*199,203*/ /*199,203*/;
  }
}

```

# /out/class_binding_special_chars.ts
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
    decls: 1,
    vars: 6,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵclassProp('text-primary/80', ctx.expr)('data-active:text-green-300/80', ctx.expr)(
          "data-[size='large']:p-8",
          ctx.expr,
        );
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
        <div [class.text-primary/80]="expr"
          [class.data-active:text-green-300/80]="expr"
          [class.data-[size='large']:p-8]="expr"></div>`,
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
      filePath: 'class_binding_special_chars.ts',
      lineNumber: 9,
    });
})();

```