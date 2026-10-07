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
    "sibling_i18n_blocks.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /sibling_i18n_blocks.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    <ng-template>Content A</ng-template>
  </div>
  <div i18n>
    <ng-template>Content B</ng-template>
  </div>
`,
})
export class MyComponent {
}
```
