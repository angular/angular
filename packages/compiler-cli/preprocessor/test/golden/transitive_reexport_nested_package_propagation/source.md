# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@fake-package/a": ["./components/a/a_module.ts"],
      "@fake-package/b": ["./components/b/b_module.ts"]
    }
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { AModule } from '@fake-package/a';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<button gm2-button></button>',
  imports: [AModule],
})
export class AppComponent {}
```

# /components/a/a_module.ts
```ts
import { NgModule } from '@angular/core';
import { BModule } from '@fake-package/b';

@NgModule({
  imports: [BModule],
  exports: [BModule],
})
export class AModule {}
```

# /components/b/b_module.ts
```ts
import { NgModule } from '@angular/core';
import { MatButton } from './mat_button';

@NgModule({
  declarations: [MatButton],
  exports: [MatButton],
})
export class BModule {}
```

# /components/b/mat_button.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'button[gm2-button]',
  template: '<ng-content></ng-content>',
})
export class MatButton {}
```
