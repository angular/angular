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
    "nested_ternary_operation.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nested_ternary_operation.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    {{a?.b ? 1 : 2 }}`,
    standalone: false
})
export class MyComponent {
  a!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
