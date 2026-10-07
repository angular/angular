# /out/tree.component.ts
```ts
import { Component, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TreeComponent_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'app-tree', 0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('child', ctx_r0.child.child);
  }
}

export class TreeComponent {
  child: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TreeComponent, never> = function TreeComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TreeComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TreeComponent,
    'app-tree',
    never,
    { 'child': { 'alias': 'child'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TreeComponent,
    selectors: [['app-tree']],
    inputs: { child: 'child' },
    decls: 1,
    vars: 1,
    consts: [[3, 'child']],
    template: function TreeComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, TreeComponent_Conditional_0_Template, 1, 1, 'app-tree', 0);
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.child ? 0 : -1);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(TreeComponent, [TreeComponent]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TreeComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-tree',
                standalone: true,
                imports: [TreeComponent],
                template: `
        @if (child) {
          <app-tree [child]="child.child"></app-tree>
        }
      `,
              },
            ],
          },
        ],
        null,
        { child: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TreeComponent, {
      className: 'TreeComponent',
      filePath: 'tree.component.ts',
      lineNumber: 13,
    });
})();

```