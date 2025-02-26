# Angular Signals Implementation

This directory contains the code which powers Angular's reactive primitive, an implementation of the "signal" concept. A signal is a value which is "reactive", meaning it can notify interested consumers when it changes. There are many different implementations of this concept, with different designs for how these notifications are subscribed to and propagated, how cleanup/unsubscription works, how dependencies are tracked, etc. This document describes the algorithm behind our specific implementation of the signal pattern.

## Conceptual surface

Angular Signals are zero-argument functions (`() => T`). When executed, they return the current value of the signal. Executing signals does not trigger side effects, though it may lazily recompute intermediate values (lazy memoization).

Particular contexts (such as template expressions) can be _reactive_. In such contexts, executing a signal will return the value, but also register the signal as a dependency of the context in question. The context's owner will then be notified if any of its signal dependencies produces a new value (usually, this results in the re-execution of those expressions to consume the new values).

This context and getter function mechanism allows for signal dependencies of a context to be tracked _automatically_ and _implicitly_. Users do not need to declare arrays of dependencies, nor does the set of dependencies of a particular context need to remain static across executions.

### Source signals



### Writable signals: `signal()`

The `createSignal()` function produces a specific type of signal that tracks a stored value. In addition to providing a getter function, these signals can be wired up with additional APIs for changing the value of the signal (along with notifying any dependents of the change). These include the `.set` operation for replacing the signal value, and `.update` for deriving a new value. In Angular, these are exposed as functions on the signal getter itself. For example:

```typescript
const counter = signal(0);

counter.set(2);
counter.update(count => count + 1);
```

#### Equality

The signal creation function one can, optionally, specify an equality comparator function. The comparator is used to decide whether the new supplied value is the same, or different, as compared to the current signal’s value.

If the equality function determines that 2 values are equal it will:
* block update of signal’s value;
* skip change propagation.

### Declarative derived values

`createComputed()` creates a memoizing signal, which calculates its value from the values of some number of input signals. In Angular this is wrapped into the `computed` constructor:

```typescript
const counter = signal(0);

// Automatically updates when `counter` changes:
const isEven = computed(() => counter() % 2 === 0);
```

Because the calculation function used to create the `computed` is executed in a reactive context, any signals read by that calculation will be tracked as dependencies, and the value of the computed signal recalculated whenever any of those dependencies changes.

Similarly to signals, the `computed` can (optionally) specify an equality comparator function. 

### Side effects: `createWatch()`

The signals library provides an operation to watch a reactive function and receive notifications when the dependencies of that function change. This is used within Angular to build `effect()`.

`effect()` schedules and runs a side-effectful function inside a reactive context. Signal dependencies of this function are captured, and the side effect is re-executed whenever any of its dependencies produces a new value.

```typescript
const counter = signal(0);
effect(() => console.log('The counter is:', counter()));
// The counter is: 0

counter.set(1);
// The counter is: 1
```

Effects do not execute synchronously with the set (see the section on glitch-free execution below), but are scheduled and resolved by the framework. The exact timing of effects is unspecified.

## Untracked

`untracked` executes an arbitrary function in a non-reactive (non-tracking) context. All signals read inside of the function are not added as a dependency to a surrounding `effect`.

```typescript
const counter = signal(0);
const untrackedCounter = signal(0);
effect(() => console.log(`counter: ${counter()}, untrackedCounter: ${untracked(untrackedCounter)}`));
// counter: 0, untrackedCounter: 0

untrackedCounter.set(1);
// effect does not rerun because untrackedCounter was untracked 

counter.set(1);
// counter: 1, untrackedCounter: 1
```

## Producer and Consumer

Internally, the signals implementation is defined in terms of two abstractions, producers and consumers. Producers represents values which can deliver change notifications, such as the various flavors of `Signal`s. Consumers represents a reactive context which may depend on some number of producers. In other words, producers produce reactivity, and consumers consume it.

Implementers of either abstraction define a node object which implements the `ReactiveNode` interface, which models participation in the reactive graph. Any `ReactiveNode` can act in the role of a producer, a consumer, or both, by interacting with the appropriate subset of APIs. For example, `WritableSignal`s implement `ReactiveNode` but only operate against the producer APIs, since `WritableSignal`s don't consume other signal values.

Some concepts are both producers _and_ consumers. For example, derived `computed` expressions consume other signals to produce new reactive values.

Throughout the rest of this document, "producer" and "consumer" are used to describe `ReactiveNode`s acting in that capacity.

### The Dependency Graph

`ReactiveNode`s are linked together through a dependency graph. This dependency graph is bidirectional, but there are differences in which dependencies are tracked in each direction.

Consumers always keep track of the producers they depend on. Producers only track dependencies from consumers which are considered "live". A consumer is "live" when either:

* It sets the `consumerIsAlwaysLive` property of its `ReactiveNode` to `true`, or
* It's also a producer which is depended upon by a live consumer.

In that sense, "liveness" is a transitive property of consumers.

In practice, effects (including template pseudo-effects) are live consumers, which `computed`s are not inherently live. This means that any `computed` used in an `effect` will be treated as live, but a `computed` not read in any effects will not be.

#### Liveness and memory management

The concept of liveness allows for producer-to-consumer dependency tracking without risking memory leaks.

Consider this contrived case of a `signal` and a `computed`:

```typescript
const counter = signal(1);

let double = computed(() => counter() * 2);
console.log(double()); // 2
double = null;
```

If the dependency graph maintained a hard reference from `counter` to `double`, then `double` would be retained(not garbage collected) even though the user dropped their last reference to the actual signal. But because `double` is not live, the graph doesn't hold a reference from `counter` to `double`, and `double` can be freed when the user drops it.
#### Non-live consumers and polling

A consequence of not tracking an edge from `counter` to `double` is that when counter is changed:

```typescript
counter.set(2);
```

No notification can propagate in the graph from `counter` to `double`, to let the `computed` know that it needs to throw away its memoized value (2) and recompute (producing 4).

Instead, when `double()` is read, it polls its producers (which _are_ tracked in the graph) and checks whether any of them report having changed since the last time `double` was calculated. If not, it can safely use its memoized value.

#### With a live consumer

If an `effect` is created:

```typescript
effect(() => console.log(double()));
```

Then `double` becomes a live consumer, as it's a dependency of a live consumer (the effect), and the graph will have a hard reference from `counter` to `double` to the effect consumer. There is no risk of memory leaks though, since the effect is referencing `double` directly anyway, and the effect cannot just be dropped and must be manually destroyed (which would cause `double` to no longer be live). That is, there is no way for a reference from a producer to a live consumer to exist in the graph _without_ the consumer also referencing the producer outside of the graph.`

## "Glitch Free" property

Consider the following setup:

```typescript
const counter = signal(0);
const evenOrOdd = computed(() => counter() % 2 === 0 ? 'even' : 'odd');
effect(() => console.log(counter() + ' is ' + evenOrOdd()));

counter.set(1);
```

When the effect is first created, it will print "0 is even", as expected, and record that both `counter` and `evenOrOdd` are dependencies of the logging effect.

When `counter` is set to `1`, this invalidates both `evenOrOdd` and the logging effect. If `counter.set()` iterated through the dependencies of `counter` and triggered the logging effect first, before notifying `evenOrOdd` of the change, however, we might observe the inconsistent logging statement "1 is even". Eventually `evenOrOdd` would be notified, which would trigger the logging effect again, logging the correct statement "1 is odd".

In this situation, the logging effect's observation of the inconsistent state "1 is even" is known as a _glitch_. A major goal of reactive system design is to prevent such intermediate states from ever being observed, and ensure _glitch-free execution_.

### Push/Pull Algorithm

Angular Signals guarantees glitch-free execution by separating updates to the `ReactiveNode` graph into two phases. The first phase is performed eagerly when a producer value is changed. This change notification is propagated through the graph, notifying live consumers which depend on the producer of the potential update. Some of these consumers may be derived values and thus also producers, which invalidate their cached values and then continue the propagation of the change notification to their own live consumers, and so on. Ultimately this notification reaches effects, which schedule themselves for re-execution.

Crucially, during this first phase, no side effects are run, and no recomputation of intermediate or derived values is performed, only invalidation of cached values. This allows the change notification to reach all affected nodes in the graph without the possibility of observing intermediate or glitchy states.

Once this change propagation has completed (synchronously), the second phase can begin. In this second phase, signal values may be read by the application or framework, triggering recomputation of any needed derived values which were previously invalidated.

We refer to this as the "push/pull" algorithm: "dirtiness" is eagerly _pushed_ through the graph when a source signal is changed, but recalculation is performed lazily, only when values are _pulled_ by reading their signals.

## Dynamic Dependency Tracking

When a reactive context operation (for example, an `effect`'s side effect function) is executed, the signals that it reads are tracked as dependencies. However, this may not be the same set of signals from one execution to the next. For example, this computed signal:

```typescript
const dynamic = computed(() => useA() ? dataA() : dataB());
```

reads either `dataA` or `dataB` depending on the value of the `useA` signal. At any given point, it will have a dependency set of either `[useA, dataA]` or `[useA, dataB]`, and it can never depend on `dataA` and `dataB` at the same time.

The potential dependencies of a reactive context are unbounded. Signals may be stored in variables or other data structures and swapped out with other signals from time to time. Thus, the signals implementation must deal with potential changes in the set of dependencies of a consumer on each execution.

Dependencies of a computation are tracked in an array. When the computation is rerun, a pointer into that array is initialized to the index `0`, and each dependency read is compared against the dependency from the previous run at the pointer's current location. If there's a mismatch, then the dependencies have changed since the last run, and the old dependency can be dropped and replaced with the new one. At the end of the run, any remaining unmatched dependencies can be dropped.

## Equality Semantics

Producers may lazily produce their value (such as a `computed` which only recalculates its value when pulled). However, a producer may also choose to apply an equality check to the values that it produces, and determine that the newly computed value is "equal" semantically to the previous. In this case, consumers which depend on that value should not be re-executed. For example, the following effect:

```typescript
const counter = signal(0);
const isEven = computed(() => counter() % 2 === 0);
effect(() => console.log(isEven() ? 'even!' : 'odd!'));
```

should run if `counter` is updated to `1` as the value of `isEven` switches from `true` to `false`. But if `counter` is then set to `3`, `isEven` will recompute the same value: `false`. Therefore the logging effect should not run.

This is a tricky property to guarantee in our implementation because values are not recomputed during the push phase of change propagation. `isEven` is invalidated when `counter` is changed, which causes the logging `effect` to also be invalidated and scheduled. Naively, `isEven` wouldn't be recomputed until the logging effect actually runs and attempts to read its value, which is too late to notice that it didn't need to run at all.

### Value Versioning

To solve this problem, our implementation uses a similar technique to tracking dependency staleness. Producers track a monotonically increasing `version`, representing the semantic identity of their value. `version` is incremented when the producer produces a semantically new value. The current `version` of each dependency (producer) is saved as part of the tracked dependencies of a consumer.

Before consumers trigger their reactive operations (e.g. the side effect function for `effect`s, or the recomputation for `computed`s), they poll their dependencies and ask for `version` to be refreshed if needed. For a `computed`, this will trigger recomputation of the value and the subsequent equality check, if the value is stale (which makes this polling a recursive process as the `computed` is also a consumer which will poll its own producers). If this recomputation produces a semantically changed value, `version` is incremented.

The consumer can then compare the `version` of the new value with its last read version to determine if that particular dependency really did change. By doing this for all producers the consumer can determine that, if all `version`s match, that no _actual_ change to any dependency has occurred, and it can skip reacting to that change (e.g. skip running the side effect function).

## `Watch` primitive

`Watch` is a primitive used to build different types of effects. `Watch`es are consumers that run side-effectful functions in their reactive context, but where the scheduling of the side effect is delegated to the implementor. The `Watch` will call this scheduling operation when it receives a notification that it's stale.
