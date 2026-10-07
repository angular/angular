# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["shared.ts", "app.module.ts"]
}
```

# /shared.ts
```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SharedService {}

export const ALL_PROVIDERS = [SharedService];
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { ALL_PROVIDERS } from './shared';

const SLICED_PROVIDERS = ALL_PROVIDERS.slice();

@NgModule({
  providers: [
    ...SLICED_PROVIDERS,
  ],
})
export class AppModule {}
```
