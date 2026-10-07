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
    "content_query_read_token.ts"
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

# /content_query_read_token.ts
```ts
import {Component, ContentChild, ContentChildren, ElementRef, NgModule, QueryList, TemplateRef} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
    selector: 'content-query-component',
    template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `,
    standalone: false
})
export class ContentQueryComponent {
  @ContentChild('myRef', {read: TemplateRef}) myRef!: TemplateRef<unknown>;
  @ContentChildren('myRef1, myRef2, myRef3', {read: ElementRef}) myRefs!: QueryList<ElementRef>;
  @ContentChild(SomeDirective, {read: ElementRef}) someDir!: ElementRef;
  @ContentChildren(SomeDirective, {read: TemplateRef}) someDirs!: QueryList<TemplateRef<unknown>>;
}
@NgModule({declarations: [ContentQueryComponent]})
export class MyModule {
}
```
