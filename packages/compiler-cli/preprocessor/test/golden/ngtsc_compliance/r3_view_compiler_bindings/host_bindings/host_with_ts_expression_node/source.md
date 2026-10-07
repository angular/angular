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
    "host_with_ts_expression_node.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_with_ts_expression_node.ts
```ts
import {Component} from '@angular/core';

export function getBar(): string {
  console.log('This function cannot be extracted.');
  return `${Math.random()}`;
}

export const BAR_CONST = getBar();

@Component({
  selector: 'my-cmp',
  host: {
    'foo': BAR_CONST,
  },
  template: ``
})
export class MyComponent {
}
```
