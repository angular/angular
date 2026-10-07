# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts", "some_file.ts"]
}
```

# /some_file.ts
```ts
export interface TypeOnlySymbol {
  id: string;
}

export const DI_TOKEN = 'DI_TOKEN';
```

# /test.ts
```ts
import { Component, Inject } from '@angular/core';
import { TypeOnlySymbol, DI_TOKEN } from './some_file';

@Component({
  selector: 'app-test',
  template: '<div>Test</div>',
  standalone: true,
})
export class TestCase {
  constructor(@Inject(DI_TOKEN) private injected: TypeOnlySymbol) {}
}
```
