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
    "no_event_arg_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /no_event_arg_listener.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `<div (click)="onClick();"></div>`,
    standalone: false
})
export class MyComponent {
  onClick() {}
}
```
