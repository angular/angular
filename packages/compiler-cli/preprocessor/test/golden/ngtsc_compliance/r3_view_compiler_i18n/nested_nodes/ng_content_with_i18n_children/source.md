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
    "ng_content_with_i18n_children.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_content_with_i18n_children.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <ng-content>
      <span i18n="@@MY_ID">a <b>b</b> c</span>
    </ng-content>
  `,
})
export class MyComponent {}
```
