# /out/namespace_attr.ngtypecheck.ts
```ts
/**
 * TCB for /namespace_attr.ts
 * @generated
 */

import * as i0 from './namespace_attr';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.value /*129,134*/ /*129,134*/;
  }
}

```

# /out/namespace_attr.ts
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
    decls: 2,
    vars: 1,
    consts: [['id', 'foo', 0, 'xlink', 'href', '/foo', 'name', 'foo']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵnamespaceSVG();
        i0.ɵɵdomElement(0, 'use')(1, 'use', 0);
      }
      if (rf & 2) {
        i0.ɵɵattribute('href', ctx.value, null, 'xlink');
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
        <svg:use [attr.xlink:href]="value"/>
        <svg:use id="foo" xlink:href="/foo" name="foo"/>
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
      filePath: 'namespace_attr.ts',
      lineNumber: 10,
    });
})();

```