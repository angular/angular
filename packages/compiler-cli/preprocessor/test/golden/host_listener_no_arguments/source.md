# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["dir.ts"]
}
```

# /dir.ts
```ts
import { Directive, HostListener } from '@angular/core';

@Directive({ selector: '[myDir]' })
export class MyDir {
  @HostListener()
  click() {}

  @HostListener()
  focus = () => {};
}
```
