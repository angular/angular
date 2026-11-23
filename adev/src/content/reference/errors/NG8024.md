# Conflicting Host Directive Binding

Two or more host directive declarations expose the **same input or output under different aliases**,
making it impossible for Angular to merge the duplicate host directive instances.

This error arises from the [diamond composition pattern](guide/directives/directive-composition-api#host-directive-de-duplication):
two directives both declare the same shared directive in their `hostDirectives`, but each exposes
one of its bindings under a different alias name.

```angular-ts
@Directive()
export class Shared {
  readonly value = input('');
}

@Directive({
  selector: '[dirA]',
  hostDirectives: [{directive: Shared, inputs: ['value: aliasA']}],
})
export class DirA {}

@Directive({
  selector: '[dirB]',
  hostDirectives: [{directive: Shared, inputs: ['value: aliasB']}], // different alias!
})
export class DirB {}

@Component({
  selector: 'app-root',
  // NG8024: Shared.value is exposed as both "aliasA" (via DirA) and "aliasB" (via DirB).
  template: `<div dirA dirB></div>`,
  imports: [DirA, DirB],
})
export class AppComponent {}
```

## Debugging the error

The error message identifies the directive and the input or output that is conflicting. Find every
`hostDirectives` declaration that includes that shared directive and inspect the `inputs` or
`outputs` arrays for the conflicting binding.

To resolve the error, pick one of the following approaches:

- **Use the same alias in both places.** Both host directive declarations must expose the binding
  under the same public name.
- **Remove the alias from one or both declarations.** If neither declaration needs to expose the
  binding to consumers, omit it from the `inputs` or `outputs` arrays entirely.

See [Host directive de-duplication](guide/directives/directive-composition-api#host-directive-de-duplication)
for more information on how Angular merges duplicate host directives and what constitutes a conflict.
