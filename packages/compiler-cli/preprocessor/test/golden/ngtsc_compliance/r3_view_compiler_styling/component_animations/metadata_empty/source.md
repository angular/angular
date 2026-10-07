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
    "metadata_empty.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /metadata_empty.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', animations: [], template: '',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
