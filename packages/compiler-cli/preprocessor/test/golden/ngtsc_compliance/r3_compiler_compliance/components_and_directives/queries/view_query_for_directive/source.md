# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "some.directive.ts",
    "view_query_for_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /some.directive.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: '[someDir]',
    standalone: false
})
export class SomeDirective {
}
```

# /view_query_for_directive.ts
```ts
import {Component, NgModule, QueryList, ViewChild, ViewChildren} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
    selector: 'view-query-component',
    template: `
    <div someDir></div>
  `,
    standalone: false
})
export class ViewQueryComponent {
  @ViewChild(SomeDirective) someDir!: SomeDirective;
  @ViewChildren(SomeDirective) someDirs!: QueryList<SomeDirective>;
}

@NgModule({declarations: [SomeDirective, ViewQueryComponent]})
export class MyModule {
}
```
