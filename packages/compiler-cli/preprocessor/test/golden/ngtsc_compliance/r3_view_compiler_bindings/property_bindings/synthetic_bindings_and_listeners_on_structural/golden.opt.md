# /out/synthetic_bindings_and_listeners_on_structural.ngtypecheck.ts
```ts
/**
 * TCB for /synthetic_bindings_and_listeners_on_structural.ts
 * @generated
 */

import * as i0 from './synthetic_bindings_and_listeners_on_structural';
import * as i1 from '@angular/animations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      this.field /*137,142*/ /*137,142*/;
      ($event: i1.AnimationEvent /*T:EP*/): any => {
        this.fn(/*165,167*/ $event /*168,174*/) /*165,175*/;
      };
    }
  }
}

```

# /out/synthetic_bindings_and_listeners_on_structural.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_button_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, 'button');
    i0.ɵɵlistener(
      '@anim.start',
      function MyComponent_button_0_Template_button_animation_anim_start_0_listener(
        $event: any,
      ): any {
        i0.ɵɵrestoreView(_r1);
        const ctx_r1: any = i0.ɵɵnextContext();
        return i0.ɵɵresetView(ctx_r1.fn($event));
      },
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    const ctx_r1: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('@anim', ctx_r1.field);
  }
}

export class MyComponent {
  field!: any;
  fn!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-cmp']],
    decls: 1,
    vars: 1,
    consts: [[4, 'ngIf']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_button_0_Template, 1, 1, 'button', 0);
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
                selector: 'my-cmp',
                template: `
        <button
          *ngIf="true"
          [@anim]="field"
          (@anim.start)="fn($event)">
        </button>
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
      filePath: 'synthetic_bindings_and_listeners_on_structural.ts',
      lineNumber: 13,
    });
})();

```