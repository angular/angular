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
    "host_dollar_any.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_dollar_any.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: '[hostBindingDir]',
    host: {
        '[style.color]': '$any("red")',
    },
    template: ``,
    standalone: false
})
export class HostBindingDir {
}
```
