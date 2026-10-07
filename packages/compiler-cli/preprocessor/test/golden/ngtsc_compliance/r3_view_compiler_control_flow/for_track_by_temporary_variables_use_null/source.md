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
    "for_track_by_temporary_variables_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /for_track_by_temporary_variables_use_null.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @for (item of items; track item?.name?.[0]?.toUpperCase() ?? foo) {}
    @for (item of items; track item.name ?? $index ?? foo) {}
  `,
})
export class MyApp {
  foo: any;
  items: {name?: string}[] = [];
}
```
