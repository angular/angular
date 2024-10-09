# Track expression resulted in duplicated keys for a given collection.

A track expression specified in the `@for` loop evaluated to duplicated keys for a given collection, ex.:

```typescript
@Component({
    template: `@for (item of items; track item.value) {{{item.value}}}`,
})
class TestComponent {
    items = [{key: 1, value: 'a'}, {key: 2, value: 'b'}, {key: 3, value: 'a'}];
}
```

In the provided example the `item.key` tracking expression will find two duplicate keys `a` (at index 0 and 2). 

Duplicate keys are problematic from the correctness point of view: since the `@for` loop can't uniquely identify items it might choose DOM nodes corresponding to _another_ item (with the same key) when performing DOM moves or destroy.

There is also performance penalty associated with duplicated keys - internally Angular must use more sophisticated and slower data structures while repeating over collections with duplicated keys.

## Fixing the error

Change the tracking expression such that it uniquely identifies an item in a collection. In the discussed example the correct track expression would use the unique `key` property (`item.key`):

```typescript
@Component({
    template: `@for (item of items; track item.key) {{{item.value}}}`,
})
class TestComponent {
    items = [{key: 1, value: 'a'}, {key: 2, value: 'b'}, {key: 3, value: 'a'}];
}
```
