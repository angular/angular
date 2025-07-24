# Missing Iterable Differ

`NgFor` could not find an iterable differ for the value passed in. Make sure it's an iterable, like an `Array`.

## Debugging the error

When using ngFor in a template, you must use some type of Iterable, like `Array`, `Set`, `Map`, etc.
If you're trying to iterate over the keys in an object, you should look at the [KeyValue pipe](/api/common/KeyValuePipe) instead.
