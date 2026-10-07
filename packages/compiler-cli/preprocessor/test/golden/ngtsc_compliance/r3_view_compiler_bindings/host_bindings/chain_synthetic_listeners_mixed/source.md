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
    "chain_synthetic_listeners_mixed.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_synthetic_listeners_mixed.ts
```ts
import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '',
  host: {
    '(mousedown)': 'mousedown()',
    '(@animation.done)': 'done()',
    '(mouseup)': 'mouseup()',
  },
  standalone: false,
})
export class MyComponent {
  @HostListener('@animation.start')
  start() {}

  @HostListener('click')
  click() {}

  mousedown() {}
  done() {}
  mouseup() {}
}
```
