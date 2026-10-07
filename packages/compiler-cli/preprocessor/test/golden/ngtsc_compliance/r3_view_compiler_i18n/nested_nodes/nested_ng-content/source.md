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
    "nested_ng-content.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /nested_ng-content.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
  <div i18n>
    <ng-content select="special"></ng-content>
    <ng-content></ng-content>
  </div>
`,
})
export class MyComponent {
}
```
