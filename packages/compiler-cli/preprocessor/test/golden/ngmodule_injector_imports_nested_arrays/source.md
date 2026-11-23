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

@Directive({
  selector: '[sdir]',
  standalone: true
})
export class StandaloneDir {}

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

// A nested array with a filtered entry: ngtsc flattens the element's references and
// emits only the survivors, so the inner array does not reach the output.
@NgModule({
  imports: [[SharedModule, StandaloneDir, SharedModule]]
})
export class NestedFilteredModule {}

// A nested array whose references all survive is emitted verbatim, nesting included.
@NgModule({
  imports: [[SharedModule, OtherModule]]
})
export class NestedAllKeptModule {}

// Nested arrays in `exports` are flattened by `resolveTypeList` before the exported
// NgModules are appended to the injector imports.
@NgModule({
  exports: [[SharedModule, OtherModule]]
})
export class NestedExportsModule {}

// Mixed nesting depth: the first element is kept verbatim, the second is flattened
// because it contains a filtered entry.
@NgModule({
  imports: [SharedModule, [OtherModule, [StandaloneDir, SharedModule]]]
})
export class DeepNestedModule {}

// A ModuleWithProviders anywhere inside a nested array forces the whole element to be
// emitted verbatim, even though the array also contains a filtered directive.
@NgModule({
  imports: [[SharedModule.forRoot(), StandaloneDir]]
})
export class NestedMwpModule {}

// Nested `exports` are flattened at any depth, and a module reached twice is appended twice.
@NgModule({
  exports: [SharedModule, [OtherModule, [SharedModule]]]
})
export class DeepNestedExportsModule {}

// Nesting on both fields at once: import-derived entries come first, then export-derived ones.
@NgModule({
  imports: [[StandaloneDir, SharedModule]],
  exports: [[OtherModule]]
})
export class NestedBothModule {}

// An empty nested array has no references to filter, so it stays verbatim.
@NgModule({
  imports: [[]]
})
export class EmptyNestedModule {}

// Every reference in the nested array is filtered out, so nothing is emitted at all.
@NgModule({
  imports: [[StandaloneDir]]
})
export class AllFilteredNestedModule {}

// A flattened nested element ahead of a verbatim ModuleWithProviders element: the MWP has
// to land at index 2, after the two references the nested element contributed.
@NgModule({
  imports: [[SharedModule, StandaloneDir, SharedModule], SharedModule.forRoot(), OtherModule]
})
export class NestedBeforeMwpModule {}

// A nested element that contributes no surviving reference must not shift the position of
// the verbatim ModuleWithProviders element that follows it.
@NgModule({
  imports: [[StandaloneDir], SharedModule.forRoot()]
})
export class EmptyNestedBeforeMwpModule {}

// The filtering half of the nested `exports` walk: a directive nested in `exports` is not
// an NgModule and so contributes nothing to the injector imports.
@NgModule({
  imports: [SharedModule],
  exports: [[Dir, OtherModule]]
})
export class NestedExportsFilteredModule {}

// A ModuleWithProviders two levels down still forces the whole top-level element verbatim.
@NgModule({
  imports: [[[SharedModule.forRoot()]]]
})
export class DeepMwpModule {}

// The innermost array is filtered away entirely while its siblings survive.
@NgModule({
  imports: [[SharedModule, [StandaloneDir]]]
})
export class InnerAllFilteredModule {}

// Base case of the `exports` recursion.
@NgModule({
  exports: [[]]
})
export class EmptyNestedExportsModule {}

// A verbatim (all-kept) nested `imports` element alongside a flattened nested `exports`.
@NgModule({
  imports: [[SharedModule, OtherModule]],
  exports: [[OtherModule]]
})
export class VerbatimImportsNestedExportsModule {}
```
