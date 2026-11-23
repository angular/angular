# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["service.ts", "generic.injectable.ts"]
}
```

# /service.ts
```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  getData(): string {
    return 'hello';
  }
}
```

# /generic.injectable.ts
```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GenericInjectable<T> {
  value: T | null = null;
}
```
