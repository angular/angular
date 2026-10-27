# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts", "comp-b.component.ts"]
}
```

# /app.module.ts
```ts
import { NgModule, Component, forwardRef } from '@angular/core';
import { CompB } from './comp-b.component';

// `CompA` is declared below, so the reference genuinely needs `forwardRef`. That makes it a
// synthetic reference, which sets `remoteScopesMayRequireCycleProtection` and forces the
// remote-scope arrays into closures — the runtime value may not exist yet when
// `ɵɵsetComponentScope` runs.
@NgModule({
  declarations: [forwardRef(() => CompA), CompB],
  exports: [CompB],
})
export class AppModule {}

// CompA and CompB reference each other across a file boundary, which is what makes the
// scope cyclic and triggers remote scoping in the first place.
@Component({
  selector: 'comp-a',
  template: '<div>CompA: <comp-b></comp-b></div>',
  standalone: false,
})
export class CompA {}
```

# /comp-b.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-b',
  template: '<div>CompB: <comp-a></comp-a></div>',
  standalone: false,
})
export class CompB {}
```
