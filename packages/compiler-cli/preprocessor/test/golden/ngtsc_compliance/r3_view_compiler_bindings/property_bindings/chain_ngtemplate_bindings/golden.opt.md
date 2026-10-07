# /out/chain_ngtemplate_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /chain_ngtemplate_bindings.ts
 * @generated
 */

import * as i0 from './chain_ngtemplate_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/chain_ngtemplate_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {}

export class MyComponent {
  myTitle = 'hello';
  buttonId = 'custom-id';
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
    decls: 1,
    vars: 3,
    consts: [[3, 'title', 'id', 'tabindex']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, 'ng-template', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', ctx.myTitle)('id', ctx.buttonId)('tabindex', 1);
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
                template:
                  '<ng-template [title]="myTitle" [id]="buttonId" [tabindex]="1"></ng-template>',
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
      filePath: 'chain_ngtemplate_bindings.ts',
      lineNumber: 8,
    });
})();

```