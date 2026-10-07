# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts

```ts
import { Component, Directive, ViewChild, forwardRef } from '@angular/core';

declare const log: (value: unknown) => void;

// Upstream reaches a `forwardRef(...)` through `unwrapExpression`, which strips ONLY
// parentheses and `as` casts -- never `!`, `<T>x` or `satisfies`. Query predicates take the
// syntactic `tryUnwrapForwardRef` path, so every spelling upstream declines to unwrap must be
// emitted as the original `forwardRef(...)` call rather than as `DepDirective`.
@Component({
  selector: 'app-host',
  standalone: true,
  template: '',
  // `!` is stripped by the partial evaluator, so this one still resolves.
  hostDirectives: [{ directive: forwardRef(() => DepDirective)! }],
})
export class HostComponent {
  // Unwrapped: plain call, `as` cast, parentheses, and an `as` cast on the argument.
  @ViewChild(forwardRef(() => DepDirective)) plain!: DepDirective;
  @ViewChild(forwardRef(() => DepDirective) as any) asCast!: DepDirective;
  @ViewChild((forwardRef(() => DepDirective))) parenthesized!: DepDirective;
  @ViewChild(forwardRef((() => DepDirective))) parenthesizedArg!: DepDirective;
  @ViewChild(forwardRef(((() => DepDirective) as any))) asCastArg!: DepDirective;

  // NOT unwrapped: wrappers `unwrapExpression` leaves in place.
  @ViewChild(forwardRef(() => DepDirective)!) nonNull!: DepDirective;
  @ViewChild(<any>forwardRef(() => DepDirective)) typeAssertion!: DepDirective;
  @ViewChild(forwardRef(() => DepDirective) satisfies any) satisfiesCast!: DepDirective;
  @ViewChild(forwardRef((() => DepDirective)!)) nonNullArg!: DepDirective;

  // NOT unwrapped: upstream requires the block body to hold exactly one statement, so a body
  // that merely *starts* with `return` is rejected.
  @ViewChild(
    forwardRef(() => {
      return DepDirective;
      log(1);
    }),
  )
  returnFirst!: DepDirective;
}

// `imports` is resolved by the partial evaluator upstream, not syntactically, and the
// evaluator sees through `!` as well. Every spelling here must keep resolving to
// `DepDirective` -- narrowing the syntactic helper must not reach this path.
@Component({
  selector: 'app-imports',
  standalone: true,
  template: '<div dep></div>',
  imports: [
    forwardRef(() => DepDirective)!,
    forwardRef(() => DepDirective) as any,
    (forwardRef(() => DepDirective)),
    forwardRef((() => DepDirective)),
  ],
})
export class ImportsComponent {}

@Directive({ selector: '[dep]', standalone: true })
export class DepDirective {}
```
