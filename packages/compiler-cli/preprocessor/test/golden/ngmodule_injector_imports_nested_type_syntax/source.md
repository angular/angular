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
import { NgModule, Directive } from '@angular/core';

@Directive({ selector: '[a]', standalone: true })
export class ADirective {}

@NgModule({}) export class AModule {}
@NgModule({}) export class BModule {}

export const SHARED = [AModule, BModule];
```

# /app.module.ts
```ts
import { NgModule } from '@angular/core';
import { AModule, BModule, ADirective, SHARED } from './shared';

// Type-only syntax is peeled off the *outermost* expression of a top-level element, which is as
// far as a span can reach: erasing it from a nested position would mean rewriting the text
// rather than selecting a subrange of it. Two shapes hit that limit, pinned here so that a
// future fix is visibly a fix.
//
// Optimized, verified against ngc 22.1.0-next.6:
//   ngc:  imports: [[AModule, BModule], SHARED]
//   ours: imports: [[AModule as any, BModule], SHARED]
// The spread's own assertion is peeled — the element *is* the spread argument — so only the
// nested one survives.
//
// Local re-prints each element from source, where the spread keeps its `...` and so keeps the
// assertion with it:
//   ours: imports: [[AModule as any, BModule], ...(SHARED as any), ADirective]
//
// Cosmetic rather than a broken emit: this compiler's output is itself TypeScript, so `tsc`
// erases the assertion downstream exactly as ngtsc's printer would have.
@NgModule({
  imports: [[AModule as any, BModule], ...(SHARED as any), ADirective],
})
export class AppModule {}
```
