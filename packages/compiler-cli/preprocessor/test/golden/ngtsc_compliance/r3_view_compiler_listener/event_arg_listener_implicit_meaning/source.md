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
    "event_arg_listener_implicit_meaning.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /event_arg_listener_implicit_meaning.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: '<div (click)="c($event)"></div>',
    standalone: false
})
class Comp {
  c(event: any) {}
}
```
