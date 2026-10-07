# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.directive.ts"]
}
```

# /app.directive.ts
```ts
import { Directive } from '@angular/core';

interface LocalInterface {
  foo: string;
}

@Directive({
  selector: '[appRoot]',
  standalone: true,
  host: {
    '[attr.foo]': 'prop.foo'
  }
})
export class AppDirective<T extends LocalInterface> {
  prop!: T;
}
```
