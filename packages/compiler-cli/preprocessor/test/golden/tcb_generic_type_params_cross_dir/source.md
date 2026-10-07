# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "src/app/app.component.ts",
    "src/components/list.component.ts",
    "src/components/filter.directive.ts",
    "src/components/local_item.component.ts",
    "src/components/tree/index.ts",
    "src/components/tree.component.ts",
    "src/components/legacy_module.ts",
    "src/components/dts_list.d.ts",
    "src/components/models.ts"
  ]
}
```

# /src/components/models.ts
```ts
export interface SelectionModel<T> {
  selected: T;
}
export interface DefaultItem {
  id: string;
}
```

# /src/components/list.component.ts
```ts
import { Component, Input } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';

@Component({
  selector: 'mat-selection-list',
  template: '',
  standalone: true,
})
export class MatSelectionList<T extends SelectionModel<unknown> = SelectionModel<DefaultItem>> {
  @Input() value!: T;
}
```

# /src/components/filter.directive.ts
```ts
import { Directive, Input } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';

@Directive({
  selector: '[filterDir]',
  standalone: true,
})
export class FilterDirective<T extends SelectionModel<U>, U extends DefaultItem = DefaultItem> {
  @Input('filterDir') filterData!: T;
}
```

# /src/components/local_item.component.ts
```ts
import { Component, Input } from '@angular/core';

export interface LocalItemType {
  key: string;
}

@Component({
  selector: 'local-item-comp',
  template: '',
  standalone: true,
})
export class LocalItemComponent<T extends LocalItemType = LocalItemType> {
  @Input() item!: T;
}
```

# /src/components/tree/index.ts
```ts
export interface TreeNode<T> {
  value: T;
}
export interface DefaultNodeData {
  label: string;
}
```

# /src/components/tree.component.ts
```ts
import { Component, Input } from '@angular/core';
import { TreeNode, DefaultNodeData } from './tree/index';

@Component({
  selector: 'tree-comp',
  template: '',
  standalone: true,
})
export class TreeComponent<T extends TreeNode<DefaultNodeData> = TreeNode<DefaultNodeData>> {
  @Input() tree!: T;
}
```

# /src/components/legacy_module.ts
```ts
import { NgModule, Component, Input } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';

@Component({
  selector: 'legacy-generic-comp',
  template: '',
  standalone: false,
})
export class LegacyGenericComponent<T extends SelectionModel<unknown> = SelectionModel<DefaultItem>> {
  @Input() legacyValue!: T;
}

@NgModule({
  declarations: [LegacyGenericComponent],
  exports: [LegacyGenericComponent],
})
export class LegacyModule {}
```

# /src/components/dts_list.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './models';

export declare class MatDtsList<T extends i1.SelectionModel<unknown> = i1.SelectionModel<i1.DefaultItem>> {
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
}
```

# /src/app/app.component.ts
```ts
import { Component } from '@angular/core';
import { MatSelectionList } from '../components/list.component';
import { FilterDirective } from '../components/filter.directive';
import { LocalItemComponent } from '../components/local_item.component';
import { TreeComponent } from '../components/tree.component';
import { LegacyModule } from '../components/legacy_module';
import { MatDtsList } from '../components/dts_list';

@Component({
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
})
export class AppComponent {
  selection: any;
}
```
