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

### Algorithm

At its core, a deep signal is a `computed`-like node which ignores notifications from the graph when it cannot be affected by the change. This is true when two conditions are met together:

- The notification was triggered by a deep signal writing to the parent;
- It's deriving a different property.
