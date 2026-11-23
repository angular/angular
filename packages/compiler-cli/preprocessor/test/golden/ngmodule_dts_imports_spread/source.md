# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["modules.ts", "extra.d.ts", "app.component.ts", "app.module.ts"]
}
```

# /modules.ts
```ts
import { NgModule, Directive } from '@angular/core';

@Directive({
  selector: '[dirC]',
  standalone: false,
})
export class DirC {}

@NgModule({
  declarations: [DirC],
  exports: [DirC],
})
export class ModuleC {}

@Directive({
  selector: '[dirD]',
  standalone: false,
})
export class DirD {}

@NgModule({
  declarations: [DirD],
  exports: [DirD],
})
export class ModuleD {}
```

# /extra.d.ts
```ts
import { ModuleC, ModuleD } from './modules';

export declare const EXTRA_MODULES: [typeof ModuleC, typeof ModuleD];
```

# /app.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div dirC dirD></div>',
  standalone: false,
})
export class AppComponent {}
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { EXTRA_MODULES } from './extra';

@NgModule({
  imports: [...EXTRA_MODULES],
  declarations: [AppComponent],
})
export class AppModule {}
```
