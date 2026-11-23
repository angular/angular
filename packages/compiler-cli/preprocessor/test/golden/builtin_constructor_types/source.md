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
import {Injectable} from '@angular/core';

@Injectable()
export class BuiltinCtorService {
  constructor(
    err: ErrorConstructor,
    arr: Int32ArrayConstructor,
    dec: MethodDecorator,
  ) {}
}
```
