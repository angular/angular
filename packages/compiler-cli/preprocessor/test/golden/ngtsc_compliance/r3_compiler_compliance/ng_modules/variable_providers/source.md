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
    "variable_providers.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /variable_providers.ts
```ts
import {InjectionToken, NgModule} from '@angular/core';

const PROVIDERS = [{provide: new InjectionToken('token'), useValue: 1}];

@NgModule({providers: PROVIDERS})
export class FooModule {
}
```
