# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["dts-module.d.ts", "cross-file.ts", "app.module.ts"]
}
```

# /dts-module.d.ts

```ts
import * as i0 from '@angular/core';
import { ModuleWithProviders } from '@angular/core';

export declare class DtsModule {
  static forRoot(): ModuleWithProviders<DtsModule>;
  static ɵfac: i0.ɵɵFactoryDeclaration<DtsModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<DtsModule, never, never, never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<DtsModule>;
}
```

# /cross-file.ts

```ts
import { Directive, Injectable, ModuleWithProviders, NgModule } from '@angular/core';

@Injectable()
export class CrossService {}

@Directive({
  selector: '[crossDir]',
  standalone: false
})
export class CrossDir {}

@NgModule({
  declarations: [CrossDir],
  exports: [CrossDir],
  providers: [CrossService]
})
export class CrossModule {
  static forRoot(): ModuleWithProviders<CrossModule> {
    return { ngModule: CrossModule, providers: [] };
  }
}

export const CROSS_FILE_MWP = CrossModule.forRoot();
```

# /app.module.ts

```ts
import { Directive, Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { DtsModule } from './dts-module';
import { CROSS_FILE_MWP } from './cross-file';

@Injectable()
export class SharedService {}

@Directive({
  selector: '[dir]',
  standalone: false
})
export class Dir {}

// `SharedService` is what a dropped `SharedModule` entry costs at runtime: the injector never
// reaches this module's own `providers`. (The `providers` passed to `forRoot()` are discarded
// by ngtsc on the `exports` path either way — only the module itself carries over.)
@NgModule({
  declarations: [Dir],
  exports: [Dir],
  providers: [SharedService]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return { ngModule: SharedModule, providers: [] };
  }
}

@NgModule({})
export class OtherModule {}

// A `ModuleWithProviders` reaching `exports` is unwrapped to its `ngModule`, so
// `SharedModule` still lands in the injector imports.
@NgModule({
  exports: [SharedModule.forRoot() as any]
})
export class MwpExportModule {}

// Reached through an identifier rather than syntactically.
const SHARED_WITH_PROVIDERS = SharedModule.forRoot();

@NgModule({
  exports: [SHARED_WITH_PROVIDERS as any]
})
export class MwpAliasExportModule {}

// The same, but resolved across a file boundary, so the reference is emitted through the
// import manager rather than as a local identifier.
@NgModule({
  exports: [CROSS_FILE_MWP as any]
})
export class MwpCrossFileExportModule {}

// Nested inside an array in `exports` (the only spelling that type-checks as written).
@NgModule({
  exports: [[SharedModule.forRoot()]]
})
export class MwpNestedExportModule {}

// The unwrapped module keeps its source position relative to the other exports.
@NgModule({
  exports: [OtherModule, SharedModule.forRoot() as any, OtherModule]
})
export class MwpExportOrderModule {}

// Export-derived entries still follow the ones contributed by `imports`.
@NgModule({
  imports: [OtherModule],
  exports: [SharedModule.forRoot() as any]
})
export class MwpImportAndExportModule {}

// A bare object literal of the `ModuleWithProviders` shape is unwrapped the same way.
@NgModule({
  exports: [{ ngModule: SharedModule, providers: [] } as any]
})
export class MwpLiteralExportModule {}

// Unwrapping happens before nested arrays are flattened, so an `ngModule` that is itself an
// array contributes every module in it.
@NgModule({
  exports: [{ ngModule: [SharedModule, OtherModule], providers: [] } as any]
})
export class MwpArrayNgModuleExportModule {}

// The declaration-file form, which the `ModuleWithProviders<T>` return-type recognizer
// resolves rather than the evaluator descending into a function body.
@NgModule({
  exports: [DtsModule.forRoot() as any]
})
export class MwpDtsExportModule {}

// `ModuleWithProviders` in `imports` is unaffected: that element is kept verbatim.
@NgModule({
  imports: [SharedModule.forRoot()],
  exports: [OtherModule]
})
export class MwpImportModule {}

// A verbatim (`ModuleWithProviders`) `imports` element in last position must keep its index
// once `exports` starts appending entries behind it.
@NgModule({
  imports: [OtherModule, SharedModule.forRoot()],
  exports: [SharedModule.forRoot() as any]
})
export class MwpTrailingVerbatimModule {}

// The same, with a re-printed nested array ahead of the verbatim element so that both
// verbatim spans must land before the export-derived entry.
@NgModule({
  imports: [[OtherModule, OtherModule], SharedModule.forRoot()],
  exports: [SharedModule.forRoot() as any]
})
export class MwpNestedThenVerbatimModule {}
```
