# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["input_history_directive.ts"]
}
```

# /private-types.ts
```ts
export interface PrivateControl {
  id: string;
}
```

# /form-field.ts
```ts
import type { PrivateControl as ShadowedByPrivateImport } from './private-types';

interface MatFormFieldControl<T> {
  value: T | null;
}

export class MatFormField {
  private control?: ShadowedByPrivateImport;
}
```

# /form-field-control.ts
```ts
export abstract class MatFormFieldControl<T> {
  value: T | null = null;
}

export class ShadowedByPrivateImport {}
```

# /public-api.ts
```ts
export * from './form-field';
export * from './form-field-control';
```

# /input_history_directive.ts
```ts
import { Directive, Optional, Self } from '@angular/core';
import { MatFormFieldControl, ShadowedByPrivateImport } from './public-api';

@Directive({ selector: '[foo]' })
export class FooDirective {
  constructor(
    @Optional() @Self() private readonly matInput: MatFormFieldControl<string> | null,
    private readonly other: ShadowedByPrivateImport,
  ) {}
}
```
