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
    "for.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div i18n>
      Content:
      @for (item of items; track item) {
        before<span>middle</span>after
      } @empty {
        before<div>empty</div>after
      }!
    </div>
  `,
    standalone: false
})
export class MyApp {
  items = [1, 2, 3];
}
```
