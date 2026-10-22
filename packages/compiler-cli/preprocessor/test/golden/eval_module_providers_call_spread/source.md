# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["feature.ts", "app.module.ts"]
}
```

# /feature.ts
```ts
import { Injectable } from '@angular/core';

@Injectable()
export class FeatureService {}

export function getFeatureProviders() {
  return [FeatureService];
}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { getFeatureProviders } from './feature';

@NgModule({
  providers: [
    ...getFeatureProviders(),
  ],
})
export class AppModule {}
```
