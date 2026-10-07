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
    "local_reference.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /local_reference.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: '<input #user>Hello {{user.value}}!',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
