# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.module.ts"]
}
```

# /app.module.ts
```ts
import { Directive, ModuleWithProviders, NgModule } from '@angular/core';

@Directive({
  selector: '[dir]',
  standalone: false
})
export class Dir {}

@NgModule({
  declarations: [Dir],
  exports: [Dir]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return { ngModule: SharedModule, providers: [] };
  }
}

@NgModule({})
export class OtherModule {}

@NgModule({
  imports: [SharedModule, SharedModule]
})
export class DupImportsModule {}

@NgModule({
  imports: [SharedModule],
  exports: [SharedModule]
})
export class ImportAndExportModule {}

@NgModule({
  exports: [SharedModule, SharedModule]
})
export class DupExportsModule {}

@NgModule({
  imports: [SharedModule, SharedModule, OtherModule],
  exports: [SharedModule, OtherModule]
})
export class DupBothModule {}

@NgModule({
  imports: [[SharedModule, SharedModule]],
  exports: [SharedModule]
})
export class NestedVerbatimModule {}

@NgModule({
  imports: [SharedModule.forRoot(), SharedModule.forRoot()]
})
export class DupMwpModule {}

// A duplicate reference ahead of a verbatim (ModuleWithProviders) element must still
// advance the position of that element in the emitted list.
@NgModule({
  imports: [SharedModule, SharedModule, SharedModule.forRoot(), OtherModule]
})
export class DupBeforeMwpModule {}
```
