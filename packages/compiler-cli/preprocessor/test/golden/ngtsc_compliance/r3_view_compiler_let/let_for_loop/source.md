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
    "let_for_loop.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_for_loop.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @for (item of items; track item) {
      @let outerFirst = $first;

      @for (subitem of item.children; track subitem) {
        @let innerFirst = $first;

        {{outerFirst || innerFirst}}
      }
    }
  `,
})
export class MyApp {
  items: {children: any[]}[] = [];
}
```
