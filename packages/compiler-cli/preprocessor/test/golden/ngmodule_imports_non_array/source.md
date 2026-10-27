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
import { NgModule, Directive } from '@angular/core';

@Directive({
  selector: '[shared]',
  standalone: false,
})
export class SharedDirective {}

@NgModule({
  declarations: [SharedDirective],
  exports: [SharedDirective],
})
export class SharedModule {}

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
import { SHARED_IMPORTS } from './shared';

@NgModule({
  imports: SHARED_IMPORTS,
  declarations: [AppComponent],
})
export class AppModule {}
```
