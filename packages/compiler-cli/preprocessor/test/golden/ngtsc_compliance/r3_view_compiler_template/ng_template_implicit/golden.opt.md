# /out/ng_template_implicit.ngtypecheck.ts
```ts
/**
 * TCB for /ng_template_implicit.ts
 * @generated
 */

import * as i0 from './ng_template_implicit';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*113,114*/ = _t1.$implicit; /*109,114*/
      '' + _t2 /*131,132*/;
    }
  }
}

```

# /out/ng_template_implicit.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const a_r1: any = ctx.$implicit;
    i0.ɵɵtextInterpolate(a_r1);
  }
}

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
    vars: 1,
    consts: [[3, 'ngIf']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_ng_template_0_Template, 1, 1, 'ng-template', 0);
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
                template: '<ng-template let-a [ngIf]="true">{{a}}</ng-template>',
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
      filePath: 'ng_template_implicit.ts',
      lineNumber: 7,
    });
})();

```