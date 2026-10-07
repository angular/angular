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
    "view_query_read_token.ts"
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

# /view_query_read_token.ts
```ts
import {Component, ElementRef, NgModule, QueryList, TemplateRef, ViewChild, ViewChildren} from '@angular/core';

import {SomeDirective} from './some.directive';

@Component({
    selector: 'view-query-component',
    template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `,
    standalone: false
})
export class ViewQueryComponent {
  @ViewChild('myRef', {read: TemplateRef}) myRef!: TemplateRef<unknown>;
  @ViewChildren('myRef1, myRef2, myRef3', {read: ElementRef}) myRefs!: QueryList<ElementRef>;
  @ViewChild(SomeDirective, {read: ElementRef}) someDir!: ElementRef;
  @ViewChildren(SomeDirective, {read: TemplateRef}) someDirs!: QueryList<TemplateRef<unknown>>;
}

@NgModule({declarations: [ViewQueryComponent]})
export class MyModule {
}
```
