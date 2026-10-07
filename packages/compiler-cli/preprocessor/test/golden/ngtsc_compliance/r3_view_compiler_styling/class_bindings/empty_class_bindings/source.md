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
    "empty_class_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /empty_class_bindings.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: `<div [class.color]></div>`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
