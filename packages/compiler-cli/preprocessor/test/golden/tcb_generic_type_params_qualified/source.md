# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "app.component.ts",
    "list.component.ts",
    "local-list.component.ts",
    "generic-dir.directive.ts",
    "dts-list.d.ts",
    "models.ts"
  ]
}
```

# /models.ts
```ts
export interface SelectionModel<T> {
  selected: T;
}
export interface DefaultItem {
  id: string;
}
```

# /list.component.ts
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

# /local-list.component.ts
```ts
import { Component, Input } from '@angular/core';

export interface LocalModel {
  name: string;
}

@Component({
  selector: 'mat-local-list',
  template: '',
  standalone: true,
})
export class MatLocalList<T extends LocalModel = LocalModel> {
  @Input() value!: T;
}
```

# /generic-dir.directive.ts
```ts
import { Directive, Input } from '@angular/core';
import { SelectionModel as CustomModel, DefaultItem } from './models';

@Directive({
  selector: '[genericDir]',
  standalone: true,
})
export class GenericDir<T extends CustomModel<U>, U extends DefaultItem = DefaultItem> {
  @Input('genericDir') data!: T;
}
```

# /dts-list.d.ts
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

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { MatSelectionList } from './list.component';
import { MatLocalList } from './local-list.component';
import { GenericDir } from './generic-dir.directive';
import { MatDtsList } from './dts-list';

@Component({
  selector: 'app-root',
  imports: [MatSelectionList, MatLocalList, GenericDir, MatDtsList],
  template: `
    <mat-selection-list [value]="selection"></mat-selection-list>
    <mat-local-list [value]="selection"></mat-local-list>
    <div [genericDir]="selection"></div>
    <mat-dts-list [value]="selection"></mat-dts-list>
  `,
  standalone: true,
})
export class AppComponent {
  selection: any;
}
```
