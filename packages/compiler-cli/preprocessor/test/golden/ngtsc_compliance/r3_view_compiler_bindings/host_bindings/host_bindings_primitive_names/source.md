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
    "host_bindings_primitive_names.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_bindings_primitive_names.ts
```ts
import {Directive, HostBinding, NgModule} from '@angular/core';

@Directive({
    selector: '[hostBindingDir]',
    host: {
        '[class.a]': 'true',
        '[class.b]': 'false',
    },
    standalone: false
})
export class HostBindingDir {
  @HostBinding('class.c') true: any;
  @HostBinding('class.d') false: any;
  @HostBinding('class.e') other: any;
}

@NgModule({declarations: [HostBindingDir]})
export class MyModule {
}
```
