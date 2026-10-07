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
    "query_with_emit_distinct_changes_only.ts"
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

# /query_with_emit_distinct_changes_only.ts
```ts
import {Component, ContentChildren, ElementRef, NgModule, QueryList, TemplateRef, ViewChildren} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
    selector: 'content-query-component',
    template: `
    <div someDir></div>
    <div #myRef></div>
  `,
    standalone: false
})
export class ContentQueryComponent {
  @ContentChildren('myRef', {emitDistinctChangesOnly: true}) myRefs!: QueryList<ElementRef>;
  @ContentChildren('myRef', {emitDistinctChangesOnly: false}) oldMyRefs!: QueryList<ElementRef>;

  @ViewChildren(SomeDirective, {emitDistinctChangesOnly: true}) someDirs!: QueryList<any>;
  @ViewChildren(SomeDirective, {emitDistinctChangesOnly: false}) oldSomeDirs!: QueryList<any>;
}
@NgModule({declarations: [ContentQueryComponent]})
export class MyModule {
}
```
