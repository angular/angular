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
    "self_closing_tags_nested.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /self_closing_tags_nested.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-comp', template: 'hello',
    standalone: false
})
export class MyComp {
}

@Component({
    template: `
    <my-comp title="a">Before<my-comp title="b"></my-comp>After</my-comp>
  `,
    standalone: false
})
export class App {
}

@NgModule({declarations: [App, MyComp]})
export class MyModule {
}
```
