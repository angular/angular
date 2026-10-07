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
    "chain_synthetic_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_synthetic_bindings.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <button
      [title]="myTitle"
      [@expand]="expansionState"
      [tabindex]="1"
      [@fade]="'out'"></button>
    `,
    standalone: false
})
export class MyComponent {
  expansionState = 'expanded';
  myTitle = '';
}
```
