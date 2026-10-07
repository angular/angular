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
    "property_bindings_and_listeners.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /property_bindings_and_listeners.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <div ngNonBindable>
      <div [id]="my-id" (click)="onclick"></div>
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
