# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /providers.ts
```ts
import { InjectionToken } from '@angular/core';

export const MY_TOKEN = new InjectionToken<string>('MY_TOKEN');
export const PROVIDERS = [{ provide: MY_TOKEN, useValue: 'test' }];
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { PROVIDERS } from './providers';

@Component({
  selector: 'app-root',
  template: '<h1>Hello</h1>',
  providers: [...(PROVIDERS as any)],
})
export class AppComponent {}
```
