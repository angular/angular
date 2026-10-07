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
    "content_query_for_directive.ts"
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

# /content_query_for_directive.ts
```ts
import {Component, ContentChild, ContentChildren, NgModule, QueryList} from '@angular/core';
import {SomeDirective} from './some.directive';

@Component({
    selector: 'content-query-component',
    template: `
    <div><ng-content></ng-content></div>
  `,
    standalone: false
})
export class ContentQueryComponent {
  @ContentChild(SomeDirective) someDir!: SomeDirective;
  @ContentChildren(SomeDirective) someDirList!: QueryList<SomeDirective>;
}

@Component({
    selector: 'my-app',
    template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `,
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [SomeDirective, ContentQueryComponent, MyApp]})
export class MyModule {
}
```
