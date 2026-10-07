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
    "view_query_for_local_ref.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /view_query_for_local_ref.ts
```ts
import {Component, NgModule, QueryList, ViewChild, ViewChildren} from '@angular/core';

@Component({
    selector: 'view-query-component',
    template: `
    <div #myRef></div>
    <div #myRef1></div>
  `,
    standalone: false
})
export class ViewQueryComponent {
  @ViewChild('myRef') myRef: any;
  @ViewChildren('myRef1, myRef2, myRef3') myRefs!: QueryList<any>;
}

@NgModule({declarations: [ViewQueryComponent]})
export class MyModule {
}
```
