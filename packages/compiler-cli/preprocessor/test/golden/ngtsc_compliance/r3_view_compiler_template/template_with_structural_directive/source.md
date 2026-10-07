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
    "template_with_structural_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /template_with_structural_directive.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <ng-template *ngIf="true">Content</ng-template>
`,
})
export class MyComponent {
}
```
