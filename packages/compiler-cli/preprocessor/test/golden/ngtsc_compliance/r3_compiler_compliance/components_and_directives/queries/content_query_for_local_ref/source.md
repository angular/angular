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
    "content_query_for_local_ref.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /content_query_for_local_ref.ts
```ts
import {Component, ContentChild, ContentChildren, NgModule, QueryList} from '@angular/core';

@Component({
    selector: 'content-query-component',
    template: `
    <div #myRef></div>
    <div #myRef1></div>
  `,
    standalone: false
})
export class ContentQueryComponent {
  @ContentChild('myRef') myRef: any;
  @ContentChildren('myRef1, myRef2, myRef3') myRefs!: QueryList<any>;
}
@NgModule({declarations: [ContentQueryComponent]})
export class MyModule {
}
```
