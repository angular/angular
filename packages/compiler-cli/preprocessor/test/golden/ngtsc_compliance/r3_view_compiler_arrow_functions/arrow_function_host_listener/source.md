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
    "arrow_function_host_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /arrow_function_host_listener.ts
```ts
import {Directive, signal} from '@angular/core';

@Directive({
  host: {
    '(click)': 'someSignal.update(prev => prev + 1)',
    '(mousedown)': 'someSignal.update(() => componentProp + 1)',
  }
})
export class TestDir {
  someSignal = signal(0);
  componentProp = 1;
}
```
