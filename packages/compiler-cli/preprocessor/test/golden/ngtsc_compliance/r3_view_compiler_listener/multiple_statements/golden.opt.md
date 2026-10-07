# /out/multiple_statements.ngtypecheck.ts
```ts
/**
 * TCB for /multiple_statements.ts
 * @generated
 */

import * as i0 from './multiple_statements';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*166,220*/ = document.createElement('div'); /*166,220*/ /*166,220*/
    _t1.addEventListener(/*172,177*/ 'click', ($event /*T:EP*/): any => {
      ($event /*180,186*/
        .preventDefault /*187,201*/
        () /*180,203*/,
        $event /*205,211*/.target /*212,218*/) /*205,218*/ /*180,218*/;
    }) /*171,219*/;
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t2 = document.createElement('my-component'); /*247,258*/
    _t2.addEventListener(/*95,102*/ 'click', ($event /*T:EP*/): any => {
      ($event /*106,112*/
        .preventDefault /*113,127*/
        () /*106,129*/,
        $event /*131,137*/.target /*138,144*/) /*131,144*/ /*106,144*/;
    }) /*95,144*/;
  }
}

```

# /out/multiple_statements.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
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
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('click', function MyComponent_click_HostBindingHandler($event: any): any {
          $event.preventDefault();
          return $event.target;
        });
      }
    },
    decls: 1,
    vars: 0,
    consts: [[3, 'click']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div', 0);
        i0.ɵɵdomListener(
          'click',
          function MyComponent_Template_div_click_0_listener($event: any): any {
            $event.preventDefault();
            return $event.target;
          },
        );
        i0.ɵɵdomElementEnd();
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
                host: { '(click)': '$event.preventDefault(); $event.target' },
                template: `
        <div (click)="$event.preventDefault(); $event.target"></div>
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
      filePath: 'multiple_statements.ts',
      lineNumber: 10,
    });
})();

```