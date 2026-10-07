# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "bazelOptions": {
    "annotateForClosureCompiler": true
  },
  "files": ["service.ts"]
}
```

# /service.ts
```ts
import { Service } from '@angular/core';

@Service()
export class BazelService {
  getData(): string {
    return 'data';
  }
}
```
