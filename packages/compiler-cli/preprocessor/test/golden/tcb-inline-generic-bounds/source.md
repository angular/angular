# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

interface LocalInterface {
  foo: string;
}

@Component({
  selector: 'app-root',
  template: '<div>{{ prop.foo }}</div>',
  standalone: true
})
export class AppComponent<T extends LocalInterface> {
  prop!: T;
}
```
