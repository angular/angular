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
    "chain_bindings_with_interpolations.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_bindings_with_interpolations.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <button
      [attr.title]="1"
      [attr.id]="2"
      attr.tabindex="prefix-{{0 + 3}}"
      attr.aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>`,
    standalone: false
})
export class MyComponent {
}
```
