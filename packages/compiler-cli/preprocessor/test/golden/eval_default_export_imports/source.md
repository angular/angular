# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "app.component.ts",
    "a.component.ts",
    "b.directive.ts",
    "b.module.ts",
    "legacy.component.ts",
    "legacy.module.ts"
  ]
}
```

# /a.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'lib-a',
  template: '<span>A</span>',
  standalone: true,
})
export class AComponent {}
```

# /b.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[libB]',
  standalone: false,
})
export class BDirective {}
```

# /b.module.ts
```ts
import { NgModule } from '@angular/core';
import { BDirective } from './b.directive';

@NgModule({
  declarations: [BDirective],
  exports: [BDirective],
})
export class BModule {}
```

# /shared.ts
```ts
import { AComponent } from './a.component';
import { BModule } from './b.module';

export default [AComponent, BModule];
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import SHARED from './shared';

@Component({
  selector: 'app-root',
  template: '<lib-a libB></lib-a>',
  standalone: true,
  imports: SHARED,
})
export class AppComponent {}
```

# /modules.ts
```ts
import { BModule } from './b.module';

export default [BModule];
```

# /legacy.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-legacy',
  template: '<span libB></span>',
  standalone: false,
})
export class LegacyComponent {}
```

# /legacy.module.ts
```ts
import { NgModule } from '@angular/core';
import { LegacyComponent } from './legacy.component';
import MODULES from './modules';

@NgModule({
  declarations: [LegacyComponent],
  imports: MODULES,
})
export class LegacyModule {}
```
