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
    "output_in_component.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /output_in_component.ts
```ts
import {Component, EventEmitter, output} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Component({
  template: 'Works',
})
export class TestComp {
  a = output();
  b = output<string>({});
  c = output<void>({alias: 'cPublic'});
  d = outputFromObservable(new EventEmitter<string>());
  e = outputFromObservable(new EventEmitter<number>());
}
```
