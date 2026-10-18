# /out/other.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SameNameComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SameNameComp, never> = function SameNameComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SameNameComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SameNameComp,
    'other-tree',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: SameNameComp,
      selectors: [['other-tree']],
      decls: 2,
      vars: 0,
      template: function SameNameComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'span');
          i0.ɵɵtext(1, 'other');
          i0.ɵɵelementEnd();
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SameNameComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'other-tree',
                template: '<span>other</span>',
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
    i0.ɵsetClassDebugInfo(SameNameComp, {
      className: 'SameNameComp',
      filePath: 'other.ts',
      lineNumber: 7,
    });
})();

```

# /out/tree.component.ts
```ts
import { Component, Directive, forwardRef, Input } from '@angular/core';
import { SameNameComp as OtherSameNameComp } from './other';
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
function ForwardTreeComponent_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'app-forward-tree', 0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('child', ctx_r0.child.child);
  }
}

export class DirA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirA, never> = function DirA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<DirA, '[dirA]', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirA, selectors: [['', 'dirA', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirA,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirA]',
              },
            ],
          },
        ],
        null,
        null,
      );
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TreeComponent,
      selectors: [['app-tree']],
      inputs: { child: 'child' },
      decls: 1,
      vars: 1,
      consts: [['dirA', '', 3, 'child']],
      template: function TreeComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵconditionalCreate(0, TreeComponent_Conditional_0_Template, 1, 1, 'app-tree', 0);
        }
        if (rf & 2) {
          i0.ɵɵconditional(ctx.child ? 0 : -1);
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(TreeComponent, [DirA, TreeComponent]),
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
                imports: [DirA, TreeComponent],
                template: `
        @if (child) {
          <app-tree dirA [child]="child.child"></app-tree>
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
      lineNumber: 18,
    });
})();

export class ForwardTreeComponent {
  child: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForwardTreeComponent, never> =
    function ForwardTreeComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ForwardTreeComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ForwardTreeComponent,
    'app-forward-tree',
    never,
    { 'child': { 'alias': 'child'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: ForwardTreeComponent,
      selectors: [['app-forward-tree']],
      inputs: { child: 'child' },
      decls: 1,
      vars: 1,
      consts: [['dirA', '', 3, 'child']],
      template: function ForwardTreeComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵconditionalCreate(
            0,
            ForwardTreeComponent_Conditional_0_Template,
            1,
            1,
            'app-forward-tree',
            0,
          );
        }
        if (rf & 2) {
          i0.ɵɵconditional(ctx.child ? 0 : -1);
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(ForwardTreeComponent, [
        DirA,
        forwardRef(() => ForwardTreeComponent),
      ]),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForwardTreeComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-forward-tree',
                imports: [DirA, forwardRef(() => ForwardTreeComponent)],
                template: `
        @if (child) {
          <app-forward-tree dirA [child]="child.child"></app-forward-tree>
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
    i0.ɵsetClassDebugInfo(ForwardTreeComponent, {
      className: 'ForwardTreeComponent',
      filePath: 'tree.component.ts',
      lineNumber: 31,
    });
})();

export class SameNameComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SameNameComp, never> = function SameNameComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SameNameComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SameNameComp,
    'local-tree',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: SameNameComp,
      selectors: [['local-tree']],
      decls: 2,
      vars: 0,
      template: function SameNameComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'other-tree')(1, 'local-tree');
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(SameNameComp, [OtherSameNameComp]),
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SameNameComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'local-tree',
                imports: [OtherSameNameComp],
                template: '<other-tree></other-tree><local-tree></local-tree>',
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
    i0.ɵsetClassDebugInfo(SameNameComp, {
      className: 'SameNameComp',
      filePath: 'tree.component.ts',
      lineNumber: 40,
    });
})();

```