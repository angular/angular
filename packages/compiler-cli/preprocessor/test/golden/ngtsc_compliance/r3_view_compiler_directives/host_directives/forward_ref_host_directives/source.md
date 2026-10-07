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
    "forward_ref_host_directives.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /forward_ref_host_directives.ts
```ts
import {Component, Directive, forwardRef, Input} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [forwardRef(() => DirectiveB)],
    standalone: false
})
export class MyComponent {
}

@Directive({
  hostDirectives: [{directive: forwardRef(() => DirectiveA), inputs: ['value']}],
})
export class DirectiveB {
}

@Directive({})
export class DirectiveA {
  @Input() value: any;
}
```
