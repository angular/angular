# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["shared.ts", "more.ts", "app.component.ts", "app.module.ts"]
}
```

# /shared.ts
```ts
import { NgModule, ModuleWithProviders, Directive } from '@angular/core';

@Directive({
  selector: '[shared]',
  standalone: false,
})
export class SharedDirective {}

@NgModule({
  declarations: [SharedDirective],
  exports: [SharedDirective],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return { ngModule: SharedModule, providers: [] };
  }
}
```

# /more.ts
```ts
import { SharedModule } from './shared';

export const MORE = [SharedModule.forRoot()];
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<span shared>Hello</span>',
  standalone: false,
})
export class AppComponent {}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { SharedModule } from './shared';
import { MORE } from './more';

// `SharedModule.forRoot()` is reached twice along sibling paths: directly, and through the
// `MORE` const. Each occurrence evaluates independently (as in ngtsc's `StaticInterpreter`),
// so `SharedModule` is in the module's compilation scope and `AppComponent` depends on
// `SharedDirective`.
@NgModule({
  imports: [SharedModule.forRoot(), ...MORE],
  declarations: [AppComponent],
})
export class AppModule {}
```
