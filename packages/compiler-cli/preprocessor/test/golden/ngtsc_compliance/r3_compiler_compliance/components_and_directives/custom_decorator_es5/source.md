# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES5",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "ignoreDeprecations": "6.0"
  },
  "files": [
    "custom_decorator_es5.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /custom_decorator_es5.ts
```ts
import {Component, InjectionToken} from '@angular/core';

const token = new InjectionToken('token');

export function Custom() {
  return function(target: any) {};
}

@Custom()
@Component({
    template: '',
    providers: [{ provide: token, useExisting: Comp }],
})
export class Comp {
}
```
