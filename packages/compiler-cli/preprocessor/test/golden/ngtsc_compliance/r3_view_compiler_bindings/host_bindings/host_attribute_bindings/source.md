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
    "host_attribute_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_attribute_bindings.ts
```ts
import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[hostAttributeDir]', host: { '[attr.required]': 'required' },
    standalone: false
})
export class HostAttributeDir {
  required = true;
}

@NgModule({declarations: [HostAttributeDir]})
export class MyModule {
}
```
