# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/test.ts
```ts
import * as ng from '@angular/core';
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  constructor(
    public el: ng.ElementRef,
    public vcr: ng.ViewContainerRef,
    public cdr: ng.ChangeDetectorRef,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyComponent)(
      i0.ɵɵdirectiveInject(ng.ElementRef),
      i0.ɵɵdirectiveInject(ng.ViewContainerRef),
      i0.ɵɵdirectiveInject(ng.ChangeDetectorRef),
    );
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
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div');
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
                template: '<div></div>',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [
          { type: ng.ElementRef },
          { type: ng.ViewContainerRef },
          { type: ng.ChangeDetectorRef },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'test.ts',
      lineNumber: 9,
    });
})();

```