# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts", "external.component.ts"]
}
```

# /external.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'external-comp',
  template: '<div>External</div>',
  standalone: false
})
export class ExternalComponent {}
```

# /app.module.ts
```ts
import { NgModule, forwardRef } from '@angular/core';
import { ExternalComponent } from './external.component';

@NgModule({
  declarations: [forwardRef(() => ExternalComponent)],
  exports: [forwardRef(() => ExternalComponent)],
  bootstrap: [forwardRef(() => ExternalComponent)]
})
export class AppModule {}
```
