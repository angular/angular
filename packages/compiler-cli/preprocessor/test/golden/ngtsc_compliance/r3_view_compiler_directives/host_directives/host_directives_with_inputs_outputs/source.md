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
    "host_directives_with_inputs_outputs.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_directives_with_inputs_outputs.ts
```ts
import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

@Directive({})
export class HostDir {
  @Input() value = 0;
  @Input() color = '';
  @Output() opened = new EventEmitter();
  @Output() closed = new EventEmitter();
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [{
            directive: HostDir,
            inputs: ['value', 'color: colorAlias'],
            outputs: ['opened', 'closed: closedAlias'],
        }],
    standalone: false
})
export class MyComponent {
}
```
