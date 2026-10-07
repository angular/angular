# /out/class_binding_on_structural.ngtypecheck.ts
```ts
/**
 * TCB for /class_binding_on_structural.ts
 * @generated
 */

import * as i0 from './class_binding_on_structural';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      this.field /*130,135*/ /*130,135*/;
    }
  }
}

```

# /out/class_binding_on_structural.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElement(0, 'div');
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵclassProp('bar', ctx_r0.field);
  }
}

export class MyComponent {
  field!: any;
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
    vars: 1,
    consts: [[3, 'bar', 4, 'ngIf']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_div_0_Template, 1, 2, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('ngIf', true);
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
                template: `
    		<div *ngIf="true" [class.bar]="field"></div>
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
      filePath: 'class_binding_on_structural.ts',
      lineNumber: 9,
    });
})();

```