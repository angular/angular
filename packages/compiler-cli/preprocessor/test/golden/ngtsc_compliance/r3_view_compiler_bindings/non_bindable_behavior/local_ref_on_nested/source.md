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
    "local_ref_on_nested.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /local_ref_on_nested.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <div ngNonBindable>
    <input value="one" #myInput> {{ myInput.value }}
    </div>
  `,
    standalone: false
})
export class MyComponent {
  name = 'John Doe';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
