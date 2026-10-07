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
    "host_style_bindings_with_temporaries.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_style_bindings_with_temporaries.ts
```ts
import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {
    '[style.fontSize]': 'value ?? "15px"',
    '[style.fontWeight]': 'value ?? "bold"',
  },
})
export class HostBindingDir {
  value: number|null = null;
}
```
