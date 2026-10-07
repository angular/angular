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
    "host_bindings_with_pure_functions.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_bindings_with_pure_functions.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'host-binding-comp', host: { '[id]': '["red", id]' }, template: '',
    standalone: false
})
export class HostBindingComp {
  id = 'some id';
}

@NgModule({declarations: [HostBindingComp]})
export class MyModule {
}
```
