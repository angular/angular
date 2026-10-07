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
    "basic_host_directives.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /basic_host_directives.ts
```ts
import {Component, Directive} from '@angular/core';

@Directive({host: {'class': 'dir-a'}})
export class DirectiveA {
}

@Directive({host: {'class': 'dir-b'}})
export class DirectiveB {
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [DirectiveA, DirectiveB],
    standalone: false
})
export class MyComponent {
}
```
