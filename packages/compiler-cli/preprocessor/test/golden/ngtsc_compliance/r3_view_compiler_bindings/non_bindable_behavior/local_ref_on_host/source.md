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
    "local_ref_on_host.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /local_ref_on_host.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <b ngNonBindable #myRef id="my-id">
    <i>Hello {{ name }}!</i>
    </b>
    {{ myRef.id }}
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
