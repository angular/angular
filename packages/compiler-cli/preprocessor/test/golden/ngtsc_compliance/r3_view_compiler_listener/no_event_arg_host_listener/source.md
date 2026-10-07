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
    "no_event_arg_host_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /no_event_arg_host_listener.ts
```ts
import {Component, HostListener} from '@angular/core';

@Component({
    template: '',
    host: {
        '(mousedown)': 'mousedown()',
    },
    standalone: false
})
export class MyComponent {
  mousedown() {}

  @HostListener('click')
  click() {
  }
}
```
