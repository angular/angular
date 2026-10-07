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
    "nullish_coalescing_parens_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /nullish_coalescing_parens_use_null.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <div>{{ (x && y) ?? z }}</div>
    <div>{{ x && (y ?? z) }}</div>
    <div>{{ x?.y ?? y?.z }}</div>
    <div>{{ (x?.y ?? y) || z }}</div>
    <div>{{ (x?.y ?? y) && z }}</div>
    <div>{{ z || (x?.y ?? y) }}</div>
    <div>{{ z && (x?.y ?? y) }}</div>
    `,
})
export class MyApp {
  x: any = null;
  y: any = 0;
  z: any = 1;
}
```
