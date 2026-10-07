# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component, Directive } from '@angular/core';

@Directive({
  selector: '[unusedDir]',
  standalone: true
})
export class UnusedDir {}

@Component({
  selector: 'app-root',
  template: '',
  standalone: true,
  imports: [UnusedDir]
})
export class AppComponent {}
```
