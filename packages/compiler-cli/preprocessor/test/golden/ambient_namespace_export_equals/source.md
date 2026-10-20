# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["ambient.d.ts", "app.ts"]
}
```

# /ambient.d.ts
```ts
declare namespace myLib {
  interface IService {}
  class RealService {}
}
export = myLib;
```

# /app.ts
```ts
import {Injectable} from '@angular/core';
import * as myLib from './ambient';

@Injectable()
export class UsesInterface {
  constructor(svc: myLib.IService) {}
}

@Injectable()
export class UsesClass {
  constructor(svc: myLib.RealService) {}
}
```
