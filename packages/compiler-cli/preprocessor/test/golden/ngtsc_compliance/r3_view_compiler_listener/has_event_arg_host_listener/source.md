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
    "has_event_arg_host_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /has_event_arg_host_listener.ts
```ts
import {Directive, HostListener} from '@angular/core';

@Directive()
export class MyComponent {
  @HostListener('click', ['$event.target'])
  click(target: any) {
  }
}
```
