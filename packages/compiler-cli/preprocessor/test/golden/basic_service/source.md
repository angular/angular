# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["service.ts", "generic.service.ts"]
}
```

# /service.ts
```ts
import { Service } from '@angular/core';

@Service()
export class MyService {
  getData(): string {
    return 'hello';
  }
}
```

# /generic.service.ts
```ts
import { Service } from '@angular/core';

@Service()
export class GenericService<T> {
  value: T | null = null;
}
```
