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
    "iframe_attrs.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /iframe_attrs.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <iframe allow="camera 'none'" [attr.fetchpriority]="'low'" [attr.allowfullscreen]="fullscreen"></iframe>
  `,
    standalone: false
})
export class MyComponent {
  fullscreen = 'false';
}
```
