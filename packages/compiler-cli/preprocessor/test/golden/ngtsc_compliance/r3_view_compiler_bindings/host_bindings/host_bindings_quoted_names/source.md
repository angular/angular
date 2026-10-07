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
    "host_bindings_quoted_names.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_bindings_quoted_names.ts
```ts
import {Directive, HostBinding, NgModule} from '@angular/core';

@Directive({
    selector: '[hostBindingDir]',
    standalone: false
})
export class HostBindingDir {
  @HostBinding('class.a') 'is-a': any;
  @HostBinding('class.b') 'is-"b"': any;
  @HostBinding('class.c') '"is-c"': any;
}

@NgModule({declarations: [HostBindingDir]})
export class MyModule {
}
```
