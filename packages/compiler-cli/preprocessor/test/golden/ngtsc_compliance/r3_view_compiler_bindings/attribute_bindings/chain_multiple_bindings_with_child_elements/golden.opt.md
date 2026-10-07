# /out/chain_multiple_bindings_with_child_elements.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_bindings_with_child_elements.ts
 * @generated
 */

import * as i0 from './chain_multiple_bindings_with_child_elements';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.myTitle /*97,104*/ /*97,104*/;
    this.buttonId /*117,125*/ /*117,125*/;
    1 /*144,145*/;
    1 /*171,172*/;
    ('hello') /*188,195*/;
    1 /*215,216*/ + 2 /*219,220*/ /*215,220*/;
  }
}

```

# /out/chain_multiple_bindings_with_child_elements.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['ng-component']],
    standalone: false,
    decls: 2,
    vars: 6,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'button');
        i0.ɵɵelement(1, 'span');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵattribute('title', ctx.myTitle)('id', ctx.buttonId)('tabindex', 1);
        i0.ɵɵadvance();
        i0.ɵɵattribute('id', 1)('title', 'hello')('some-attr', 1 + 2);
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
        <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1">
          <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
        </button>`,
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
      filePath: 'chain_multiple_bindings_with_child_elements.ts',
      lineNumber: 10,
    });
})();

```