# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["shared.ts", "app.module.ts"]
}
```

# /shared.ts
```ts
import { Directive, ModuleWithProviders, NgModule } from '@angular/core';

@Directive({
  selector: '[sdir]',
  standalone: true
})
export class StandaloneDir {}

@NgModule({})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return { ngModule: SharedModule, providers: [] };
  }
}

@NgModule({})
export class OtherModule {}

export const EXTERNAL_ALIAS = [SharedModule, OtherModule];

export const USE_SHARED = true;
```

# /app.module.ts
```ts
import { forwardRef, NgModule } from '@angular/core';
import { EXTERNAL_ALIAS, OtherModule, SharedModule, StandaloneDir, USE_SHARED } from './shared';

// Non-ASCII ahead of every `imports` array below, so that each element's UTF-8 byte span
// differs from its UTF-16 offset: 共有モジュール 🎁📦 — a re-printed element that were sliced
// with unconverted offsets would come out truncated or mid-character.
const LOCAL_ALIAS = [SharedModule, OtherModule];
const MIXED_ALIAS = [SharedModule, StandaloneDir];
const MWP_ALIAS = SharedModule.forRoot();

// An identifier aliasing an array of modules is kept as written: every reference it
// contributes survives filtering, so ngtsc emits the user's expression rather than
// expanding the alias into its members.
@NgModule({
  imports: [LOCAL_ALIAS]
})
export class LocalAliasModule {}

// The same holds for an alias imported from another file — the identifier is emitted, not
// the individual references it resolves to (which would need a different import).
@NgModule({
  imports: [EXTERNAL_ALIAS]
})
export class ExternalAliasModule {}

// An identifier bound to a `ModuleWithProviders` result must stay verbatim: emitting the
// resolved `SharedModule` reference instead would silently drop the providers the
// `forRoot()` call carries.
@NgModule({
  imports: [MWP_ALIAS]
})
export class MwpAliasModule {}

// A ternary is emitted as written, so the branch is still chosen at runtime — static
// evaluation only picks a branch to build the compile-time scope, and never decides the
// element's emission.
@NgModule({
  imports: [USE_SHARED ? SharedModule : OtherModule]
})
export class TernaryModule {}

// A spread contributes its argument: `...LOCAL_ALIAS` is treated exactly like a direct
// reference to `LOCAL_ALIAS`, so the spread itself disappears from the injector imports.
@NgModule({
  imports: [...LOCAL_ALIAS]
})
export class SpreadModule {}

// A spread sitting next to a `ModuleWithProviders` call must not cost the call its verbatim
// emission — both elements are kept as written, and the providers survive.
@NgModule({
  imports: [...LOCAL_ALIAS, SharedModule.forRoot()]
})
export class SpreadWithMwpModule {}

// A non-array `imports` value is a single top-level element covering the whole expression.
@NgModule({
  imports: LOCAL_ALIAS
})
export class NonArrayModule {}

// An alias whose members do not all survive filtering loses its verbatim emission: the
// surviving references are emitted individually, as ngtsc cannot filter inside the alias.
@NgModule({
  imports: [MIXED_ALIAS]
})
export class FilteredAliasModule {}

// The filtered alias contributes one reference, so the `ModuleWithProviders` that follows
// has to land at index 1 rather than being appended at the end.
@NgModule({
  imports: [MIXED_ALIAS, SharedModule.forRoot(), OtherModule]
})
export class FilteredAliasBeforeMwpModule {}

// A spread of an alias with a filtered member is likewise expanded to survivors only.
@NgModule({
  imports: [...MIXED_ALIAS, SharedModule.forRoot()]
})
export class FilteredSpreadBeforeMwpModule {}

// `forwardRef` is emitted as written — the reference it resolves to is only used to decide
// whether the element survives filtering.
@NgModule({
  imports: [forwardRef(() => OtherModule)]
})
export class ForwardRefModule {}

// Type-only syntax is erased by ngtsc's printer, so the re-printed source must skip it to land
// on the same text.
@NgModule({
  imports: [SharedModule as any, (OtherModule as any)]
})
export class TypeAssertionModule {}

// An object literal is a `ModuleWithProviders` to ngtsc purely by having an `ngModule` key, so
// it is kept verbatim whatever that key holds. Testing the key's value instead would be a
// counting bug as well as a parity one: this element lowers to two references, so treating it
// as one filtered entry would splice the `forRoot()` below it into the middle of the pair.
@NgModule({
  imports: [{ ngModule: [SharedModule, OtherModule] } as any, SharedModule.forRoot()]
})
export class ObjectLiteralNgModuleArrayModule {}

// Nesting is preserved when everything survives, and flattened to survivors when it does not —
// at any depth, and without disturbing the index of a verbatim element that follows.
@NgModule({
  imports: [[SharedModule, [OtherModule]], [[StandaloneDir, SharedModule]], SharedModule.forRoot()]
})
export class DeepNestedModule {}
```
