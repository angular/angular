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
    "no_child_elements.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /no_child_elements.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <div ngNonBindable></div>
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
