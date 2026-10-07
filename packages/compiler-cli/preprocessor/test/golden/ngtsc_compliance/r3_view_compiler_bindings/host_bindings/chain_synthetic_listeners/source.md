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
    "chain_synthetic_listeners.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_synthetic_listeners.ts
```ts
import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '',
  host: {
    '(@animation.done)': 'done()',
  },
  standalone: false,
})
export class MyComponent {
  @HostListener('@animation.start')
  start() {}

  done() {}
}
```
