# /out/src/app/app.component.ts
```ts
import { Component } from '@angular/core';
import { MatSelectionList } from '../components/list.component';
import { FilterDirective } from '../components/filter.directive';
import { LocalItemComponent } from '../components/local_item.component';
import { TreeComponent } from '../components/tree.component';
import { LegacyModule } from '../components/legacy_module';
import { MatDtsList } from '../components/dts_list';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  selection: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 6,
    vars: 6,
    consts: [
      [3, 'value'],
      [3, 'filterDir'],
      [3, 'item'],
      [3, 'tree'],
      [3, 'legacyValue'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'mat-selection-list', 0)(1, 'div', 1)(2, 'local-item-comp', 2)(
          3,
          'tree-comp',
          3,
        )(4, 'legacy-generic-comp', 4)(5, 'mat-dts-list', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('filterDir', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('item', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('tree', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('legacyValue', ctx.selection);
        i0.ɵɵadvance();
        i0.ɵɵproperty('value', ctx.selection);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [
      MatSelectionList,
      FilterDirective,
      LocalItemComponent,
      TreeComponent,
      LegacyModule,
      MatDtsList,
    ]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                imports: [
                  MatSelectionList,
                  FilterDirective,
                  LocalItemComponent,
                  TreeComponent,
                  LegacyModule,
                  MatDtsList,
                ],
                template: `
        <mat-selection-list [value]="selection"></mat-selection-list>
        <div [filterDir]="selection"></div>
        <local-item-comp [item]="selection"></local-item-comp>
        <tree-comp [tree]="selection"></tree-comp>
        <legacy-generic-comp [legacyValue]="selection"></legacy-generic-comp>
        <mat-dts-list [value]="selection"></mat-dts-list>
      `,
                standalone: true,
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'src/app/app.component.ts',
      lineNumber: 29,
    });
})();

```

# /out/src/components/dts_list.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './models';

export declare class MatDtsList<
  T extends i1.SelectionModel<unknown> = i1.SelectionModel<i1.DefaultItem>,
> {
  value: T;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatDtsList<any>,
    'mat-dts-list',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  >;
  static ɵfac: i0.ɵɵFactoryDeclaration<MatDtsList<any>, never>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatDtsList<any>, never> = function MatDtsList_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MatDtsList)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatDtsList<any>,
    'mat-dts-list',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MatDtsList,
    selectors: [['mat-dts-list']],
    inputs: { value: 'value' },
    decls: 0,
    vars: 0,
    template: function MatDtsList_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MatDtsList, [{ type: Component }], null, null);
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MatDtsList, {
      className: 'MatDtsList',
      filePath: 'src/components/dts_list.d.ts',
      lineNumber: 4,
    });
})();

```

# /out/src/components/filter.directive.ts
```ts
import { Directive, Input } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';
// @ts-ignore
import * as i0 from '@angular/core';

export class FilterDirective<T extends SelectionModel<U>, U extends DefaultItem = DefaultItem> {
  filterData!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FilterDirective<any, any>, never> =
    function FilterDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FilterDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FilterDirective<any, any>,
    '[filterDir]',
    never,
    { 'filterData': { 'alias': 'filterDir'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FilterDirective,
    selectors: [['', 'filterDir', '']],
    inputs: { filterData: [0, 'filterDir', 'filterData'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FilterDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[filterDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { filterData: [{ type: Input, args: ['filterDir'] }] },
      );
  }
}

```

# /out/src/components/legacy_module.ts
```ts
import { NgModule, Component, Input } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';
// @ts-ignore
import * as i0 from '@angular/core';

export class LegacyGenericComponent<
  T extends SelectionModel<unknown> = SelectionModel<DefaultItem>,
> {
  legacyValue!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyGenericComponent<any>, never> =
    function LegacyGenericComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LegacyGenericComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyGenericComponent<any>,
    'legacy-generic-comp',
    never,
    { 'legacyValue': { 'alias': 'legacyValue'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyGenericComponent,
    selectors: [['legacy-generic-comp']],
    inputs: { legacyValue: 'legacyValue' },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function LegacyGenericComponent_Template(rf: number, ctx: any): any {},
    dependencies: i0.ɵɵgetComponentDepsFactory(LegacyGenericComponent),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyGenericComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'legacy-generic-comp',
                template: '',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { legacyValue: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LegacyGenericComponent, {
      className: 'LegacyGenericComponent',
      filePath: 'src/components/legacy_module.ts',
      lineNumber: 9,
    });
})();

export class LegacyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyModule, never> = function LegacyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyModule)();
  };
  // @ts-ignore
  static ɵmod: LegacyModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LegacyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LegacyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [LegacyGenericComponent],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [LegacyGenericComponent],
                exports: [LegacyGenericComponent],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LegacyModule, {
      declarations: [LegacyGenericComponent],
      exports: [LegacyGenericComponent],
    });
})();

```

# /out/src/components/list.component.ts
```ts
import { Component, Input } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';
// @ts-ignore
import * as i0 from '@angular/core';

export class MatSelectionList<T extends SelectionModel<unknown> = SelectionModel<DefaultItem>> {
  value!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MatSelectionList<any>, never> =
    function MatSelectionList_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MatSelectionList)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MatSelectionList<any>,
    'mat-selection-list',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MatSelectionList,
    selectors: [['mat-selection-list']],
    inputs: { value: 'value' },
    decls: 0,
    vars: 0,
    template: function MatSelectionList_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MatSelectionList,
        [
          {
            type: Component,
            args: [
              {
                selector: 'mat-selection-list',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { value: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MatSelectionList, {
      className: 'MatSelectionList',
      filePath: 'src/components/list.component.ts',
      lineNumber: 9,
    });
})();

```

# /out/src/components/local_item.component.ts
```ts
import { Component, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export interface LocalItemType {
  key: string;
}

export class LocalItemComponent<T extends LocalItemType = LocalItemType> {
  item!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalItemComponent<any>, never> =
    function LocalItemComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalItemComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalItemComponent<any>,
    'local-item-comp',
    never,
    { 'item': { 'alias': 'item'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalItemComponent,
    selectors: [['local-item-comp']],
    inputs: { item: 'item' },
    decls: 0,
    vars: 0,
    template: function LocalItemComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalItemComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'local-item-comp',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { item: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LocalItemComponent, {
      className: 'LocalItemComponent',
      filePath: 'src/components/local_item.component.ts',
      lineNumber: 12,
    });
})();

```

# /out/src/components/tree.component.ts
```ts
import { Component, Input } from '@angular/core';
import { TreeNode, DefaultNodeData } from './tree/index';
// @ts-ignore
import * as i0 from '@angular/core';

export class TreeComponent<T extends TreeNode<DefaultNodeData> = TreeNode<DefaultNodeData>> {
  tree!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TreeComponent<any>, never> = function TreeComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TreeComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TreeComponent<any>,
    'tree-comp',
    never,
    { 'tree': { 'alias': 'tree'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TreeComponent,
    selectors: [['tree-comp']],
    inputs: { tree: 'tree' },
    decls: 0,
    vars: 0,
    template: function TreeComponent_Template(rf: number, ctx: any): any {},
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
                selector: 'tree-comp',
                template: '',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { tree: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TreeComponent, {
      className: 'TreeComponent',
      filePath: 'src/components/tree.component.ts',
      lineNumber: 9,
    });
})();

```