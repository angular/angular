# /out/css_custom_properties.ngtypecheck.ts
```ts
/**
 * TCB for /css_custom_properties.ts
 * @generated
 */

import * as i0 from './css_custom_properties';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.value /*132,137*/ /*132,137*/;
    this.value /*168,173*/ /*168,173*/;
  }
}

```

# /out/css_custom_properties.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  value: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-dir',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-dir']],
    standalone: false,
    decls: 1,
    vars: 4,
    consts: [[2, '--camel-case', 'foo', '--kebab-case', 'foo']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('--%NS%camelCase', ctx.value)('--%NS%kebab-case', ctx.value);
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
                selector: 'my-dir',
                template: `
        <div 
          [style.--camelCase]="value" 
          [style.--kebab-case]="value" 
          style="--camelCase: foo; --kebab-case: foo">
        </div>
      `,
                standalone: false,
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
      filePath: 'css_custom_properties.ts',
      lineNumber: 14,
    });
})();

```