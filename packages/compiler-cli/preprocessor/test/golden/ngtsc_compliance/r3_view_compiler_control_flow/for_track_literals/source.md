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
    "for_track_literals.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_track_literals.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    @for (item of items; track trackFn({foo: item, bar: item}, [item, item])) {
      {{item.name}}
    }
  `,
    standalone: false
})
export class MyApp {
  items: {name: string}[] = [];

  trackFn(obj: any, arr: any[]) {
    return null;
  }
}
```
