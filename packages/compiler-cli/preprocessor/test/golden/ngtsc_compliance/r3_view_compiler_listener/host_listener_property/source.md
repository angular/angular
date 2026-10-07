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
    "host_listener_property.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_listener_property.ts
```ts
import {Directive, HostListener} from '@angular/core';

@Directive()
export class MyComponent {
  @HostListener('click', ['$event'])
  handleClick = ($event: any) => {};

  @HostListener('window:beforeunload', ['$event'])
  private handleBeforeUnload = ($event: any) => {};
}
```
