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
    "host_bindings_with_temporaries_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /host_bindings_with_temporaries_use_null.ts
```ts
import {Directive, NgModule} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {'[id]': 'getData()?.id'},
  standalone: false,
})
export class HostBindingDir {
  getData: () =>
    | {
        id: number;
      }
    | undefined = () => undefined;
}

@NgModule({declarations: [HostBindingDir]})
export class MyModule {}
```
