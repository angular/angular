# /out/ng_content_with_structural_dir.ngtypecheck.ts
```ts
/**
 * TCB for /ng_content_with_structural_dir.ts
 * @generated
 */

import * as i0 from './ng_content_with_structural_dir';

/*tcb1*/
function _tcb1(this: i0.SimpleComponent) {
  if (true) {
  }
}

```

# /out/ng_content_with_structural_dir.ts
```ts
import { Component, Directive, NgModule, TemplateRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];
const _c1 = ['*ngIf', 'showContent'];
function SimpleComponent_ng_content_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵprojection(0, 0, _c1);
  }
}

export class SimpleComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SimpleComponent, never> = function SimpleComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SimpleComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SimpleComponent,
    'simple',
    never,
    {},
    {},
    never,
    ['*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleComponent,
    selectors: [['simple']],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 1,
    vars: 1,
    consts: [[4, 'ngIf']],
    template: function SimpleComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵtemplate(0, SimpleComponent_ng_content_0_Template, 1, 0, 'ng-content', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.showContent);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SimpleComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'simple',
                template: '<ng-content *ngIf="showContent"></ng-content>',
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
    i0.ɵsetClassDebugInfo(SimpleComponent, {
      className: 'SimpleComponent',
      filePath: 'ng_content_with_structural_dir.ts',
      lineNumber: 7,
    });
})();

```