# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["greeting.component.ts"]
}
```

# /greeting.component.ts
```ts
import { Directive, Injectable } from '@angular/core';

function Unrelated(clazz) { return clazz; }

@Injectable()
@Unrelated
@Directive({standalone: true})
export class GreetingDirective {}
```
