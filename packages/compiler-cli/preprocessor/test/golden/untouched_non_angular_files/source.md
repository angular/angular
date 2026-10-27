# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["fileoverview_only.ts", "constants.ts", "reexport.ts", "component.ts"]
}
```

# /fileoverview_only.ts

```ts
/**
 * @fileoverview Experiments config.
 */
```

# /constants.ts

```ts
export const EXPERIMENTS = ['a'];
```

# /reexport.ts

```ts
export {MyComponent} from './component';
```

# /component.ts

```ts
import {Component} from '@angular/core';

@Component({selector: 'my-cmp', template: ''})
export class MyComponent {}
```
