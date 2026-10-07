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
    "pipe.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /pipe.ts
```ts
import {Pipe} from '@angular/core';

@Pipe({
  name: 'stpipe',
})
export class StandalonePipe {
  transform(value: any): any {}
}
```
