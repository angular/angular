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
    "host_animate_enter.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_animate_enter.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '',
  host: {
    '[animate.enter]': "disabled ? undefined : 'enter-class'",
  }
})
export class TestCmp {
  disabled = false;
}
```
