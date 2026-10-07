# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["shared.ts", "app.component.ts", "app.module.ts"]
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
    return { ngModule: SharedModule };
  }
}

export const SHARED_IMPORTS = [SharedModule];
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
import { SharedModule, SHARED_IMPORTS } from './shared';

// LOCAL mode emits `ɵinj.imports` as the verbatim, entry-by-entry concatenation of the
// `imports` array elements: a ModuleWithProviders call (`SharedModule.forRoot()`) and a
// spread (`...SHARED_IMPORTS`) both survive unresolved. Mirrors ngtsc handler.ts#L670-L688:
// https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L670-L688
@NgModule({
  imports: [SharedModule.forRoot(), ...SHARED_IMPORTS],
  declarations: [AppComponent],
})
export class AppModule {}
```
