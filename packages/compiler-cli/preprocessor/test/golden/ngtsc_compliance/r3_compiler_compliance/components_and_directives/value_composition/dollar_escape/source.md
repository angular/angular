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
    "dollar_escape.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /dollar_escape.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: `\${{price}}`,
  standalone: false,
})
export class MyComponent {
  price = '3.50';
}
```
