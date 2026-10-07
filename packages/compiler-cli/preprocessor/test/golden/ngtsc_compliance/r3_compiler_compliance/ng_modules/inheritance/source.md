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
    "inheritance.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /inheritance.ts
```ts
import {Injectable, NgModule} from '@angular/core';

@Injectable()
export class Service {
}

@NgModule({providers: [Service]})
export class BaseModule {
  constructor(private service: Service) {}
}

@NgModule({})
export class BasicModule extends BaseModule {
}
```
