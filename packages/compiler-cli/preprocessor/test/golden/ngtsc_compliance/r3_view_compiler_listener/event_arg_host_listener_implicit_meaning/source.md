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
    "event_arg_host_listener_implicit_meaning.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /event_arg_host_listener_implicit_meaning.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    host: { '(click)': 'c($event)' },
    standalone: false
})
class Dir {
  c(event: any) {}
}
```
