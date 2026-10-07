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
    "self_closing_tags.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /self_closing_tags.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-comp', template: 'hello',
    standalone: false
})
export class MyComp {
}

@Component({
    template: `<my-comp/>`,
    standalone: false
})
export class App {
}

@NgModule({declarations: [App, MyComp]})
export class MyModule {
}
```
