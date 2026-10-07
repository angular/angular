# /out/duplicate_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /duplicate_bindings.ts
 * @generated
 */

import * as i0 from './duplicate_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.value1 /*263,269*/ /*263,269*/;
    this.value2 /*290,296*/ /*290,296*/;
    this.value1 /*326,332*/ /*326,332*/;
    this.value2 /*346,352*/ /*346,352*/;
    this.value1 /*379,385*/ /*379,385*/;
    this.value2 /*396,402*/ /*396,402*/;
    this.value1 /*429,435*/ /*429,435*/;
    this.value2 /*446,452*/ /*446,452*/;
    var _t1 /*465,539*/ = document.createElement('div'); /*465,539*/ /*465,539*/
    _t1.addEventListener(/*471,476*/ 'click', ($event /*T:EP*/): any => {
      $event /*479,485*/
        .stopPropagation /*486,501*/
        () /*479,503*/;
    }) /*470,504*/;
    _t1.addEventListener(/*506,511*/ 'click', ($event /*T:EP*/): any => {
      $event /*514,520*/
        .preventDefault /*521,535*/
        () /*514,537*/;
    }) /*505,538*/;
  }
}

```

# /out/duplicate_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  value1: any;
  value2: any;
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
    decls: 8,
    vars: 8,
    consts: [
      ['aria-label', 'hello', 'aria-label', 'hi'],
      [2, 'height', '0'],
      [1, 'cls2'],
      [3, 'tabindex'],
      [3, 'click'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div', 0);
        i0.ɵɵdomElementStart(1, 'div', 1);
        i0.ɵɵdomElement(2, 'div', 2)(3, 'div')(4, 'div', 3)(5, 'div')(6, 'div');
        i0.ɵɵdomElementStart(7, 'div', 4);
        i0.ɵɵdomListener(
          'click',
          function MyComponent_Template_div_click_7_listener($event: any): any {
            return $event.stopPropagation();
          },
        )('click', function MyComponent_Template_div_click_7_listener($event: any): any {
          return $event.preventDefault();
        });
        i0.ɵɵdomElementEnd()();
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵattribute('aria-label', ctx.value1)('aria-label', ctx.value2);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('tabIndex', ctx.value1)('tabIndex', ctx.value2);
        i0.ɵɵadvance();
        i0.ɵɵclassMap(ctx.value2);
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(ctx.value2);
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
        <div aria-label="hello" aria-label="hi"></div>
        <div style="width: 0" style="height: 0">
        <div class="cls1" class="cls2"></div>
        <div [attr.aria-label]="value1" [attr.aria-label]="value2"></div>
        <div [tabindex]="value1" [tabindex]="value2"></div>
        <div [class]="value1" [class]="value2"></div>
        <div [style]="value1" [style]="value2"></div>
        <div (click)="$event.stopPropagation()" (click)="$event.preventDefault()"></div>
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
      filePath: 'duplicate_bindings.ts',
      lineNumber: 16,
    });
})();

```