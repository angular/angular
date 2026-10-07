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
    "host_directives_with_host_aliases.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_directives_with_host_aliases.ts
```ts
import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

@Directive({})
export class HostDir {
  @Input('valueAlias') value = 1;
  @Input('colorAlias') color = '';
  @Output('openedAlias') opened = new EventEmitter();
  @Output('closedAlias') closed = new EventEmitter();
}

@Component({
    selector: 'my-component',
    template: '',
    hostDirectives: [{
            directive: HostDir,
            inputs: ['valueAlias', 'colorAlias: customColorAlias'],
            outputs: ['openedAlias', 'closedAlias: customClosedAlias'],
        }],
    standalone: false
})
export class MyComponent {
}
```
