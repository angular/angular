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
    "style_binding_important.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /style_binding_important.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div style.width!important="a{{one}}b{{two}}c"></div>
  `,
    standalone: false
})
export class MyComponent {
  one = '';
  two = '';
}
```
