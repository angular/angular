# Skip hydration flag is applied to an invalid node

This error occurs when the `ngSkipHydration` attribute was added to an inappropriate DOM node. The `ngSkipHydration` attribute can only be applied to component host nodes either directly in the template or via a host binding. It cannot be applied to other DOM nodes and will have no effect if done so other than causing this error.

More information about hydration can be found in [this guide](guide/hydration).

The following examples will trigger the error.

## Example 1

In this example, the `ngSkipHydration` attribute is applied to a `<div>` using host bindings of a directive. Since the `<div>` doesn't act as a component host node, Angular will throw an error.

```typescript
@Directive({
  selector: '[dir]',
  host: {ngSkipHydration: 'true'},
})
class Dir {
}

@Component({
  selector: 'app',
  imports: [Dir],
  template: `
    <div dir></div>
  `,
})
class SimpleComponent {
}
```

## Example 2

In this example, the `ngSkipHydration` is applied to a `<div>` as an attribute via a template.
Since the `<div>` doesn't act as a component host node, Angular will throw an error.

```typescript
@Component({
  selector: 'app',
  template: `
    <div ngSkipHydration></div>
  `,
})
class SimpleComponent {
}
```

## Debugging the error

Remove the `ngSkipHydration` attribute from any invalid DOM nodes. Alternatively, move the `ngSkipHydration` attribute to the component host node either in a template or via a host binding.
