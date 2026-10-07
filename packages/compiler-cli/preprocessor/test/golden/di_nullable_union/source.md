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
import { Directive, Injectable, Optional } from '@angular/core';

@Injectable({providedIn: 'root'})
export class Logger {}

@Directive({
  selector: '[test]',
  standalone: true,
})
export class TestDirective {
  constructor(
    @Optional() public logger: Logger | null,
  ) {}
}
```
