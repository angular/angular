# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "files": ["directives.ts"]
}
```

# /directives.ts
```ts
import {Directive} from '@angular/core';

@Directive()
export class AbstractDirective {
}
```
