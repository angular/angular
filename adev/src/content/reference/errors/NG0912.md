# Component ID generation collision

When creating components, Angular generates a unique component ID for each component. This is generated using the Angular component metadata, including but not limited:  selectors, the number of host bindings, class property names, view and content queries. When two components metadata are identical (often times sharing the same selector), an ID generation collision will occur.

Component IDs are used in Angular internally:

- for extra annotations of DOM nodes for style encapsulation
- during [hydration](guide/hydration) to restore an application state after [server-side rendering](guide/ssr).

To avoid issues that might be caused by the component ID collision, it's recommended to resolve them as described below.

## Example of a Component ID collision

```typescript
@Component({
  selector: 'my-component',
  template: 'complex-template',
})
class SomeComponent {}

@Component({
  selector: 'my-component',
  template: 'empty-template',
})
class SomeMockedComponent {}
```

Having these two components defined will trigger an ID generation collision and during development a warning will be displayed.

## Debugging the error

The warning message includes the class name of the two components whose IDs are colliding.

The problem can be resolved using one of the solutions below:

1. Change the selector of one of the two components. For example by using a pseudo-selector with no effect like `:not()` and a different tag name.

```typescript
@Component({
  selector: 'my-component:not(p)',
  template: 'empty-template',
})
class SomeMockedComponent {}
```

1. Add an extra host attribute to one of the components.

```typescript
@Component({
  selector: 'my-component',
  template: 'complex-template',
  host: {'some-binding': 'some-value'},
})
class SomeComponent {}
```
