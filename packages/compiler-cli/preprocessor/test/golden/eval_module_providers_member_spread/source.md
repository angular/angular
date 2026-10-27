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

export class SharedConfig {
  static PROVIDERS = [SharedService];
}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { SharedConfig } from './shared';

@NgModule({
  providers: [
    ...SharedConfig.PROVIDERS,
  ],
})
export class AppModule {}
```
