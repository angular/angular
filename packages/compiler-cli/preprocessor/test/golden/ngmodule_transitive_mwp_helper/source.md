# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["feature.ts", "middle.ts", "app.ts"]
}
```

# /feature.ts
```ts
import {Injectable, ModuleWithProviders, NgModule} from '@angular/core';

@Injectable()
export class FeatureService {}

@NgModule({})
export class FeatureModule {
  static forRoot(): ModuleWithProviders<FeatureModule> {
    return {ngModule: FeatureModule, providers: [FeatureService]};
  }
}

export function provideFeature(): ModuleWithProviders<FeatureModule> {
  return FeatureModule.forRoot();
}
```

# /middle.ts
```ts
import {Component, NgModule} from '@angular/core';
import {provideFeature} from './feature';

@NgModule({
  imports: [provideFeature()],
})
export class MiddleModule {}

@Component({
  selector: 'middle-comp',
  template: '',
  imports: [MiddleModule],
})
export class MiddleComp {}
```

# /app.ts
```ts
import {NgModule} from '@angular/core';
import {MiddleComp} from './middle';

@NgModule({
  imports: [MiddleComp],
})
export class AppModule {}
```
