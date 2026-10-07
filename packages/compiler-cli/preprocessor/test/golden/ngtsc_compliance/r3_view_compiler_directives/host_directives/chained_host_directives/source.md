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
    "chained_host_directives.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /chained_host_directives.ts
```ts
import {Component, Directive} from '@angular/core';

@Directive({})
export class DirectiveA {
}

@Directive({
  hostDirectives: [DirectiveA],
})
export class DirectiveB {
}

@Directive({
  hostDirectives: [DirectiveB],
})
export class DirectiveC {
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [DirectiveC],
    standalone: false
})
export class MyComponent {
}
```
