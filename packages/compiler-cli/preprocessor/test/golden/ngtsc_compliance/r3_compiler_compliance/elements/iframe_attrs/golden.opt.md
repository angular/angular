# /out/iframe_attrs.ngtypecheck.ts
```ts
/**
 * TCB for /iframe_attrs.ts
 * @generated
 */

import * as i0 from './iframe_attrs';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    ('low') /*155,160*/;
    this.fullscreen /*186,196*/ /*186,196*/;
  }
}

```

# /out/iframe_attrs.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  fullscreen = 'false';
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 1,
    vars: 2,
    consts: [['allow', "camera 'none'"]],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'iframe', 0);
      }
      if (rf & 2) {
        i0.ɵɵattribute('fetchpriority', 'low', i0.ɵɵvalidateAttribute)(
          'allowfullscreen',
          ctx.fullscreen,
          i0.ɵɵvalidateAttribute,
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
                selector: 'my-component',
                template: `
      <iframe allow="camera 'none'" [attr.fetchpriority]="'low'" [attr.allowfullscreen]="fullscreen"></iframe>
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
      filePath: 'iframe_attrs.ts',
      lineNumber: 10,
    });
})();

```