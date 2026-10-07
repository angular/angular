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
    "host_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_bindings.ts
```ts
import {Directive, HostBinding, NgModule} from '@angular/core';

@Directive({
    selector: '[hostBindingDir]',
    standalone: false
})
export class HostBindingDir {
  @HostBinding('id') dirId = 'some id';
}

@NgModule({declarations: [HostBindingDir]})
export class MyModule {
}
```
