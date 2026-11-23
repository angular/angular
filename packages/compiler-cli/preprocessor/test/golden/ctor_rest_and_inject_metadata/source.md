# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import {Inject, Injectable, InjectionToken} from '@angular/core';

export class DepService {}
export const TOKEN = new InjectionToken<DepService>('TOKEN');

@Injectable()
export class RestService {
  constructor(...args: unknown[]) {}
}

@Injectable()
export class InjectedService {
  constructor(@Inject(TOKEN) dep: DepService) {}
}
```
