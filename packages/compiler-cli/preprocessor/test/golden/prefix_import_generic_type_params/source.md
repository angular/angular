# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "repo/*": ["src/*"]
    },
    "rootDirs": ["src"]
  },
  "angularCompilerOptions": {
    "workspaceName": "repo"
  },
  "files": [
    "src/apps/dashboard.component.ts",
    "src/widgets/filter_bar.component.ts",
    "src/widgets/filter.directive.ts",
    "src/widgets/local_config.component.ts",
    "src/widgets/nested/index.ts",
    "src/widgets/nested_view.component.ts",
    "src/widgets/filter_model.ts"
  ]
}
```

# /src/widgets/filter_model.ts
```ts
export interface FilterConfig<T> {
  config: T;
}
```

# /src/widgets/filter_bar.component.ts
```ts
import { Component, Input } from '@angular/core';
import { FilterConfig } from './filter_model';

@Component({
  selector: 'filter-bar',
  template: '',
  standalone: true,
})
export class FilterBarComponent<T, P extends FilterConfig<T> = FilterConfig<T>> {
  @Input() config!: P;
}
```

# /src/widgets/filter.directive.ts
```ts
import { Directive, Input } from '@angular/core';
import { FilterConfig } from './filter_model';

@Directive({
  selector: '[filterDir]',
  standalone: true,
})
export class FilterDirective<T, P extends FilterConfig<T> = FilterConfig<T>> {
  @Input('filterDir') filterCfg!: P;
}
```

# /src/widgets/local_config.component.ts
```ts
import { Component, Input } from '@angular/core';

export interface LocalConfig {
  count: number;
}

@Component({
  selector: 'local-config-comp',
  template: '',
  standalone: true,
})
export class LocalConfigComponent<T extends LocalConfig = LocalConfig> {
  @Input() config!: T;
}
```

# /src/widgets/nested/index.ts
```ts
export interface NestedData<T> {
  data: T;
}
```

# /src/widgets/nested_view.component.ts
```ts
import { Component, Input } from '@angular/core';
import { NestedData } from './nested/index';

@Component({
  selector: 'nested-view',
  template: '',
  standalone: true,
})
export class NestedViewComponent<T extends NestedData<string> = NestedData<string>> {
  @Input() viewData!: T;
}
```

# /src/apps/dashboard.component.ts
```ts
import { Component } from '@angular/core';
import { FilterBarComponent } from '../widgets/filter_bar.component';
import { FilterDirective } from '../widgets/filter.directive';
import { LocalConfigComponent } from '../widgets/local_config.component';
import { NestedViewComponent } from '../widgets/nested_view.component';

@Component({
  selector: 'dashboard-app',
  imports: [
    FilterBarComponent,
    FilterDirective,
    LocalConfigComponent,
    NestedViewComponent,
  ],
  template: `
    <filter-bar [config]="config"></filter-bar>
    <div [filterDir]="config"></div>
    <local-config-comp [config]="config"></local-config-comp>
    <nested-view [viewData]="config"></nested-view>
  `,
  standalone: true,
})
export class DashboardComponent {
  config: any;
}
```
