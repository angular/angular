# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "host_class_bindings_with_temporaries.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_class_bindings_with_temporaries.ts
```ts
import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {
    '[class.a]': 'value ?? "class-a"',
    '[class.b]': 'value ?? "class-b"',
  },
})
export class HostBindingDir {
  value: number|null = null;
}
```
