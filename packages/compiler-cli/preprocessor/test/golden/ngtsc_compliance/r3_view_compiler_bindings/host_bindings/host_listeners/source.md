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
    "host_listeners.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_listeners.ts
```ts
import {Component, HostListener} from '@angular/core';

@Component({
    selector: 'my-cmp',
    host: {
        '(document:dragover)': 'foo($event)',
    },
    template: `
  `
})
export class MyComponent {
  foo!: any;
}
```
