# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /node_modules/angular/package.json
```json
{
  "name": "angular",
  "types": "index.d.ts"
}
```

# /node_modules/angular/index.d.ts
```ts
declare namespace angularMock {
  interface IQService {
    when(): void;
  }
  interface ITimeoutService {
    cancel(): void;
  }
}

declare const angularMock: {};

export = angularMock;
```

# /test.ts
```ts
import { Injectable, Inject } from '@angular/core';
import * as angular from 'angular';

// A parameter decorator argument is spliced into `ɵsetClassMetadata` verbatim, newlines and all,
// so one that spans several source lines makes the `ctorParameters` callback span them too. Any
// suppression covering the callback as a whole reaches only its first line, which leaves every
// parameter after the splice unguarded. The guard therefore has to sit on each parameter.
@Injectable({providedIn: 'root'})
export class MultiLineDecoratorArgService {
  constructor(
    @Inject({
      token: 'legacy.$q',
      legacy: true,
    })
    private readonly $q: angular.IQService,
    private readonly $timeout: angular.ITimeoutService,
  ) {}
}
```
