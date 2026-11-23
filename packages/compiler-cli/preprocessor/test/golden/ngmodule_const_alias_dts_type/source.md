# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["actual.ts", "alias.ts", "app.ts"]
}
```

# /actual.ts
```ts
import {NgModule} from '@angular/core';

@NgModule({})
export class ActualModule {}
```

# /alias.ts
```ts
import {ActualModule} from './actual';

export const AliasedModule = ActualModule;
```

# /app.ts
```ts
import {NgModule} from '@angular/core';
import {AliasedModule} from './alias';

@NgModule({
  imports: [AliasedModule],
  exports: [AliasedModule],
})
export class AppModule {}
```
