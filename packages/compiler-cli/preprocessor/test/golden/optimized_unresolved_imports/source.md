# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "local.component.ts"]
}
```

# /local.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-local',
  template: '<span>Local</span>',
})
export class LocalComponent {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { LocalComponent } from './local.component';
import { ExternalComponent } from '@third-party/components';

@Component({
  selector: 'app-root',
  template: '<app-local></app-local><app-external></app-external>',
  imports: [LocalComponent, ExternalComponent],
})
export class AppComponent {}
```
