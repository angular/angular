# /out/special_property_remapping_dom_property.ngtypecheck.ts
```ts
/**
 * TCB for /special_property_remapping_dom_property.ts
 * @generated
 */

import * as i0 from './special_property_remapping_dom_property';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.forValue /*82,90*/ /*82,90*/;
  }
}

```

# /out/special_property_remapping_dom_property.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  forValue = 'some-input';
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
    vars: 1,
    consts: [[3, 'for']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'label', 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('htmlFor', ctx.forValue);
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
                template: `<label [for]="forValue"></label>`,
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
      filePath: 'special_property_remapping_dom_property.ts',
      lineNumber: 6,
    });
})();

```