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
    "forward_ref.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /forward_ref.ts
```ts
import {Component, forwardRef} from '@angular/core';

@Component({
  selector: 'test',
  imports: [forwardRef(() => StandaloneComponent)],
  template: '<other-standalone></other-standalone>',
})
export class TestComponent {
}

@Component({
  selector: 'other-standalone',
  template: '',
})
export class StandaloneComponent {
}
```
