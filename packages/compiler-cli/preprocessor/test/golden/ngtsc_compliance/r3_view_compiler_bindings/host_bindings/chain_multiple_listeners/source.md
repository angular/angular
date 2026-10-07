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
    "chain_multiple_listeners.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chain_multiple_listeners.ts
```ts
import {Directive, HostListener} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: {
        '(mousedown)': 'mousedown()',
        '(mouseup)': 'mouseup()',
    },
    standalone: false
})
export class MyDirective {
  mousedown() {}
  mouseup() {}

  @HostListener('click')
  click() {
  }
}
```
