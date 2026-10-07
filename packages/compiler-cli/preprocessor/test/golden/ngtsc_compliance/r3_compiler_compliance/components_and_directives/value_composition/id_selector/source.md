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
    "id_selector.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /id_selector.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: '#my-app', template: '',
    standalone: false
})
export class SomeComponent {
}

@NgModule({declarations: [SomeComponent]})
export class MyModule {
}
```
