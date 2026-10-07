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
    "class_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /class_binding.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: `<div [class]="myClassExp"></div>`,
    standalone: false
})
export class MyComponent {
  myClassExp = {'foo': true}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
