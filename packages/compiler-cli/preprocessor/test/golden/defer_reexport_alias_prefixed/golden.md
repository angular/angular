# /out/list.ts
```ts
import { NgFor } from 'google3/my/common/index';
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function ListComponent_Defer_0_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function ListComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtemplate(0, ListComponent_Defer_0_div_0_Template, 2, 1, 'div', 0);
  }
  if (rf & 2) {
    const ctx_r1: any = i0.ɵɵnextContext();
    i0.ɵɵproperty('ngForOf', ctx_r1.items);
  }
}
function ListComponent_DeferPlaceholder_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1, 'Placeholder');
    i0.ɵɵelementEnd();
  }
}

export class ListComponent {
  items: string[] = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ListComponent, never> = function ListComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ListComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ListComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ListComponent,
    selectors: [['ng-component']],
    decls: 4,
    vars: 0,
    consts: [[4, 'ngFor', 'ngForOf']],
    template: function ListComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, ListComponent_Defer_0_Template, 1, 1)(
          1,
          ListComponent_DeferPlaceholder_1_Template,
          2,
          0,
        );
        i0.ɵɵdefer(2, 0, null, null, 1);
        i0.ɵɵdeferOnInteraction(0, -1);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ListComponent, [NgFor]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ListComponent,
        [
          {
            type: Component,
            args: [
              {
                imports: [NgFor],
                template: `
        @defer (on interaction) {
          <div *ngFor="let item of items">{{ item }}</div>
        } @placeholder {
          <span>Placeholder</span>
        }
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
    i0.ɵsetClassDebugInfo(ListComponent, {
      className: 'ListComponent',
      filePath: 'list.ts',
      lineNumber: 14,
    });
})();

```

# /out/my/common/ng_for_of.ts
```ts
import { Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class NgForOf {
  ngForOf: string[] = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NgForOf, never> = function NgForOf_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NgForOf)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    NgForOf,
    '[ngFor][ngForOf]',
    never,
    { 'ngForOf': { 'alias': 'ngForOf'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NgForOf,
    selectors: [['', 'ngFor', '', 'ngForOf', '']],
    inputs: { ngForOf: 'ngForOf' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NgForOf,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[ngFor][ngForOf]',
              },
            ],
          },
        ],
        null,
        { ngForOf: [{ type: Input }] },
      );
  }
}

```