# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["main.ts", "lib.ts", "intermediate.ts", "feature.module.ts"]
}
```

# /feature.module.ts
```ts
import { NgModule, Component } from '@angular/core';

@Component({
  selector: 'feature-cmp',
  template: 'Feature',
  standalone: false,
})
export class FeatureComponent {}

@NgModule({
  declarations: [FeatureComponent],
  exports: [FeatureComponent],
})
export class FeatureModule {}
```

# /intermediate.ts
```ts
export { FeatureModule } from './feature.module';
```

# /lib.ts
```ts
export { FeatureModule as FinalFeatureModule } from './intermediate';
```

# /main.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
import { FinalFeatureModule } from './lib';

@Component({
  selector: 'app-root',
  template: '<feature-cmp></feature-cmp>',
  standalone: false,
})
export class AppComponent {}

@NgModule({
  imports: [FinalFeatureModule],
  declarations: [AppComponent]
})
export class AppModule {}

@Component({
  selector: 'app-forward',
  template: '<feature-cmp laterDir></feature-cmp>',
  standalone: false,
})
export class AppForwardComponent {}

@Directive({
  selector: '[laterDir]',
  standalone: false,
})
export class LaterDirective {}

@NgModule({
  imports: [FinalFeatureModule],
  declarations: [AppForwardComponent, LaterDirective]
})
export class AppForwardModule {}
```


