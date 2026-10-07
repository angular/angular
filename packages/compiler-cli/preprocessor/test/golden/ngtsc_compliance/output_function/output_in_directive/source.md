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
    "output_in_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /output_in_directive.ts
```ts
import {Directive, EventEmitter, output} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';

@Directive({
})
export class TestDir {
  a = output();
  b = output<string>({});
  c = output<void>({alias: 'cPublic'});
  d = outputFromObservable(new EventEmitter<string>());
  e = outputFromObservable(new EventEmitter<number>());
}
```
