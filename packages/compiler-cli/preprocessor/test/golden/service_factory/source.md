# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["service.ts"]
}
```

# /service.ts
```ts
import { Service } from '@angular/core';

@Service({factory: () => new MyService()})
export class MyService {
  getData(): string {
    return 'hello';
  }
}
```
