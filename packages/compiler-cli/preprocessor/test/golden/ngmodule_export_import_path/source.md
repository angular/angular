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
      "@fake-package/button": ["./components/gm2/button/button_module.ts"]
    }
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { Gm2ButtonModule } from '@fake-package/button';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<button gm2-button></button>',
  imports: [Gm2ButtonModule],
})
export class AppComponent {}
```

# /components/gm2/button/button_module.ts
```ts
import { NgModule } from '@angular/core';
import { MatButton } from './mat_button';

@NgModule({
  declarations: [MatButton],
  exports: [MatButton],
})
export class Gm2ButtonModule {}
```

# /components/gm2/button/mat_button.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'button[gm2-button]',
  template: '<ng-content></ng-content>',
})
export class MatButton {}
```
