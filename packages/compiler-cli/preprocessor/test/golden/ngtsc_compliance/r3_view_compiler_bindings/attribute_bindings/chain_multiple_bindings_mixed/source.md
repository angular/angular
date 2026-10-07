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
    "chain_multiple_bindings_mixed.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_multiple_bindings_mixed.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <button [attr.title]="1" [id]="2" [attr.tabindex]="3" attr.aria-label="prefix-{{1 + 3}}">
    </button>
  `,
    standalone: false
})
export class MyComponent {
}
```
