# Deep signals

A "deep signal" is a `WritableSignal` whose value comes from a specific property in a parent `WritableSignal`. Its value is always the value from the parent, and updating its value updates the value within the parent. This table shows the behavior of deep signals compared to other signal flavors when deriving a value from a parent property in this way.

| Signal Type    | Reading                                         | Writing                                  |
| -------------- | ----------------------------------------------- | ---------------------------------------- |
| `computed`     | Value derived from parent                       | 🚫 Not allowed                           |
| `linkedSignal` | Value derived from parent OR local value if set | Does not change parent, only local value |
| `deepSignal`   | Value derived from parent                       | Updates value in parent                  |

As a code example:

```ts
// Parent signal with complex object value.
const model = signal({user: {name: 'Alex'}, company: 'Google'});

// Deep signal for `user` property of the model.
const user = deepSignal(model, 'user');

console.log(user()); // {name: 'Alex'}

// Updating `user` updates the parent.
user.set({name: 'Bob'});
console.log(model()); // {user: {name: 'Bob'}, company: 'Google'}
```

Deep signals combine the derivation of a value with the ability to update that value in the parent, making them an excellent tool for modeling hierarchical state.

## Performance

A key aspect of deep signals is their performance advantage over other methods of derivation.

Consider a similar setup as the example above, in plain signals:

```ts
// Parent signal with complex object value.
const model = signal({user: {name: 'Alex'}, company: 'Google'});

const user = computed(() => model().user);
const company = computed(() => model().company);

effect(() => console.log(user())); // {name: 'Alex'}

// Update the company to 'Waymo':
model.update(value => {...value, company: 'Waymo'});
```

The update to `model` replaces its object value with a new one that stores the new `company` value. Even though `model` changes, `user`'s value is unaffected: the update to `model` does not touch the value of its `user` property.

In ordinary signal operations, the `user` computed would be marked "maybe dirty" from its dependency on `model`, as would the effect which depends on `user`. Eventually, rerunning the `user` derivation would detect that its value didn't actually change, and so the effect would short-circuit and not actually run. Semantically, this is correct behavior.

In a large graph, however, changing the signal at the top which is the source of truth for the entire graph would schedule _all_ effects depending on any part of the model this way. This is still a non-trivial cost, even with the short-circuiting.

Deep signals address this issue by leveraging their knowledge about _what_ is changing in the parent's value. Since a deep signal only changes its own property in the parent, other deep signals deriving other properties are guaranteed to be unaffected and do not need to be notified. When a deep signal write occurs in a large graph, only those signals which _actually observe the write_ are notified, meaning only effects that could potentially need to rerun are marked dirty.

## Algorithm

`deepSignal` is a hybrid, building on the `computed` reactive node type but in some ways behaving like a plain `signal`. It has a computation function that reads `parent()[ property ]` (where `property` is optionally reactive).

`deepSignal`'s write path is deeply specialized. The algorithm is as follows:

1. When a `deepSignal` write occurs, the `deepSignal` marks itself dirty and notifies its consumers of its change, as if it were a plain `signal`. A difference here is that it temporarily uses the value of `COMPUTING` for its value, which guards against `deepSignal` cycles.

2. It then pushes its own reactive node to a global stack of `deepSignal` writers.

3. It updates the `parent` writable signal, building a new value based on the `parent`'s current value and the `deepSignal`'s `property`.

4. It updates its own value and marks itself clean.

5. It pops itself from the `deepSignal` writer stack.

The `deepSignal` writer stack is used to implement the dirty notification short-circuiting mechanism described in the Performance section. The `DEEP_SIGNAL_NODE` type overrides the behavior of `node.dirty`, and will additionally report itself dirty when there is an active `deepSignal` writer that meets the criteria:

- When the active `deepSignal` writer shares its same parent (they're both derived from the same parent signal).
- The active `deepSignal` writer is writing to a _different_ key than the current signal is monitoring.

If both of these conditions are true, the `deepSignal`'s node will report itself as `dirty`, which short circuits any dirty notifications being sent when the active writer updates the parent.

# Structural signals

The `deepSignal` mechanism allows the construction of another useful type of signal, which we call `structuralSignal`. A `structuralSignal` is derived from another `WritableSignal` and returns the same value. It behaves like `computed(() => parent())` with one exception: it does not get notified when the parent changes via a `deepSignal` write. Since a `deepSignal` write only changes an existing property, a `structuralSignal` can be used when a consumer is only interested in values that might have different shapes.
