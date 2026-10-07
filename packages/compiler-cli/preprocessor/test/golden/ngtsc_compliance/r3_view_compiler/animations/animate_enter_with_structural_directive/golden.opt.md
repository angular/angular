# /out/animate_enter_with_structural_directive.ngtypecheck.ts
```ts
/**
 * TCB for /animate_enter_with_structural_directive.ts
 * @generated
 */

import * as i0 from './animate_enter_with_structural_directive';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*259,310*/ = null! as i0.AnyStructuralDirective; /*T:VAE*/
  }
}

```

# /out/animate_enter_with_structural_directive.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_p_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'p');
    i0.ɵɵanimateEnter('slide');
    i0.ɵɵtext(1, 'Sliding Content');
    i0.ɵɵelementEnd();
  }
}

export class AnyStructuralDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AnyStructuralDirective, never> =
    function AnyStructuralDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AnyStructuralDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AnyStructuralDirective,
    '[any-structural-directive]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AnyStructuralDirective,
    selectors: [['', 'any-structural-directive', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AnyStructuralDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[any-structural-directive]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

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
    decls: 2,
    vars: 0,
    consts: [[4, 'any-structural-directive']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtemplate(1, MyComponent_p_1_Template, 2, 0, 'p', 0);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [AnyStructuralDirective],
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
                imports: [AnyStructuralDirective],
                template: `
        <div>
          <p *any-structural-directive animate.enter="slide">Sliding Content</p>
        </div>
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
      filePath: 'animate_enter_with_structural_directive.ts',
      lineNumber: 17,
    });
})();

```