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
    "directive_host_binding_slots.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /directive_host_binding_slots.ts
```ts
import {Directive, HostBinding} from '@angular/core';

@Directive({
    selector: '[myWidthDir]',
    standalone: false
})
export class WidthDirective {
  @HostBinding('style.width') myWidth = 200;

  @HostBinding('class.foo') myFooClass = true;

  @HostBinding('id') id = 'some id';

  @HostBinding('title') title = 'some title';
}
```
