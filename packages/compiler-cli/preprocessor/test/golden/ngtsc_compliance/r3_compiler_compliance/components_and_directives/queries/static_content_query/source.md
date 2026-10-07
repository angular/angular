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
    "static_content_query.ts"
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

# /static_content_query.ts
```ts
import {Component, ContentChild, ElementRef, NgModule} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
    selector: 'content-query-component',
    template: `
    <div><ng-content></ng-content></div>
  `,
    standalone: false
})
export class ContentQueryComponent {
  @ContentChild(SomeDirective, {static: true}) someDir!: SomeDirective;
  @ContentChild('foo') foo!: ElementRef;
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
