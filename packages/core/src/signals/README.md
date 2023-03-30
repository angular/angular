# Angular Signals Implementation

This directory contains the code for Angular's reactive primitive, an implementation of the "signal" concept. A signal is a value which is "reactive", meaning it can notify interested consumers when it changes. There are many different implementations of this concept, with different designs for how these notifications are subscribed to and propagated, how cleanup/unsubscription works, how dependencies are tracked, etc. This document describes the algorithm behind our specific implementation of the signal pattern.

## Conceptual surface

Angular Signals are zero-argument functions (`() => T`). When executed, they return the current value of the signal. Executing signals does not trigger side effects, though it may lazily recompute intermediate values (lazy memoization).

Particular contexts (such as template expressions) can be _reactive_. In such contexts, executing a signal will return the value, but also register the signal as a dependency of the context in question. The context's owner will then be notified if any of its signal dependencies produces a new value (usually, this results in the re-execution of those expressions to consume the new values).

This context and getter function mechanism allows for signal dependencies of a context to be tracked _automatically_ and _implicitly_. Users do not need to declare arrays of dependencies, nor does the set of dependencies of a particular context need to remain static across executions.

### Writable signals: `signal()`

The `signal()` function produces a specific type of signal known as a `WritableSignal`. In addition to being a getter function, `WritableSignal`s have an additional API for changing the value of the signal (along with notifying any dependents of the change). These include the `.set` operation for replacing the signal value, `.update` for deriving a new value, and `.mutate` for performing internal mutation of the current value. These are exposed as functions on the signal getter itself.

```typescript
const counter = signal(0);

counter.set(2);
counter.update(count => count + 1);
```

The signal value can be also updated in-place, using the dedicated `.mutate` method:

```typescript
const todoList = signal<Todo[]>([]);

todoList.mutate(list => {
  list.push({title: 'One more task', completed: false});
});
```

#### Equality

The signal creation function one can, optionally, specify an equality comparator function. The comparator is used to decide whether the new supplied value is the same, or different, as compared to the current signal’s value.

If the equality function determines that 2 values are equal it will:
* block update of signal’s value;
* skip change propagation.

### Declarative derived values: `computed()`

`computed()` creates a memoizing signal, which calculates its value from the values of some number of input signals.

```typescript
const counter = signal(0);

// Automatically updates when `counter` changes:
const isEven = computed(() => counter() % 2 === 0);
```

Because the calculation function used to create the `computed` is executed in a reactive context, any signals read by that calculation will be tracked as dependencies, and the value of the computed signal recalculated whenever any of those dependencies changes.

Similarly to signals, the `computed` can (optionally) specify an equality comparator function. 

### Side effects: `effect()`

`effect()` schedules and runs a side-effectful function inside a reactive context. Signal dependencies of this function are captured, and the side effect is re-executed whenever any of its dependencies produces a new value.

```typescript
const counter = signal(0);
effect(() => console.log('The counter is:', counter()));
// The counter is: 0

counter.set(1);
// The counter is: 1
```

Effects do not execute synchronously with the set (see the section on glitch-free execution below), but are scheduled and resolved by the framework. The exact timing of effects is unspecified.

## Producer and Consumer

Internally, the signals implementation is defined in terms of two abstractions, producers and consumers.Producers represents values which can deliver change notifications, such as the various flavors of `Signal`s. Consumers represents a reactive context which may depend on some number of producers. In other words, producers produce reactivity, and consumers consume it.

Implementers of either abstraction derive from the `ReactiveNode` base class, which models participation in the reactive graph. Any `ReactiveNode` can act in the role of a producer, a consumer, or both, by interacting with the appropriate subset of APIs on `ReactiveNode`. For example, `WritableSignal`s extend `ReactiveNode` but only operate against the producer APIs, since `WritableSignal`s don't consume other signal values.

Some concepts are both producers _and_ consumers. For example, derived `computed` expressions consume other signals to produce new reactive values.

Throughout the rest of this document, "producer" and "consumer" are used to describe `ReactiveNode`s acting in that capacity.

### The Dependency Graph

`ReactiveNode`s keep track of dependency `ReactiveEdge`s to each other. Producers are aware of which consumers depend on their value, while consumers are aware of all of the producers on which they depend. These references are always bidirectional.

A major design feature of Angular Signals is that dependency edges (`ReactiveEdge`s) are tracked using weak references (`WeakRef`). At any point, it's possible that a consumer node may go out of scope and be garbage collected, even if it is still referenced by a producer node (or vice versa). This removes the need for explicit cleanup operations that would remove these dependency edges for signals going "out of scope". Lifecycle management of signals is greatly simplified as a result, and there is no chance of memory leaks due to the dependency tracking.

To simplify tracking `ReactiveEdge`s via `WeakRef`s, `ReactiveNode`s have numeric IDs generated when they're created. These IDs are used as `Map` keys instead of the tracked node objects, which are instead stored in the `ReactiveEdge` as `WeakRef`s.

At various points during the read or write of signal values, these `WeakRef`s are dereferenced. If a reference turns out to be `undefined` (that is, the other side of the dependency edge was reclaimed by garbage collection), then the dependency `ReactiveEdge` can be cleaned up.

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

Angular Signals guarantees glitch-free execution by separating updates to the `ReactiveNode` graph into two phases. The first phase is performed eagerly when a producer value is changed. This change notification is propagated through the graph, notifying consumers which depend on the producer of the potential update. Some of these consumers may be derived values and thus also producers, which invalidate their cached values and then continue the propagation of the change notification to their own consumers, and so on. Other consumers may be effects, which schedule themselves for re-execution.

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

A naive approach would be to simply remove all old dependency edges before re-executing the reactive operation, or to mark them all as stale beforehand and remove the ones that don't get read. This is conceptually simple, but computationally heavy, especially for reactive contexts that have a largely unchanging set of dependencies.

### Dependency Edge Versioning

Instead, our implementation uses a lighter weight approach to dependency invalidation which relies on a monotonic version counter maintained by the consumer, called the `trackingVersion`. Before the consumer's reactive operation is executed, its `trackingVersion` is incremented. When a signal is read, the `trackingVersion` of the consumer is stored in the dependency `ReactiveEdge`, where it is available to the producer.

When a producer has an updated value, it iterates through its outgoing edges to any interested consumers to notify them of the change. At this point, the producer can check whether the dependency is current or stale by comparing the consumer's current `trackingVersion` to the one stored on the dependency `ReactiveEdge`. A mismatch means that the consumer's dependencies have changed and no longer include that producer, so that consumer is not notified and the stale edge is instead removed.

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

To solve this problem, our implementation uses a similar technique to tracking dependency staleness. Producers track a monotonically increasing `valueVersion`, representing the semantic identity of their value. `valueVersion` is incremented when the producer produces a semantically new value. The current `valueVersion` is saved into the dependency `ReactiveEdge` structure when a consumer reads from the producer.

Before consumers trigger their reactive operations (e.g. the side effect function for `effect`s, or the recomputation for `computed`s), they poll their dependencies and ask for `valueVersion` to be refreshed if needed. For a `computed`, this will trigger recomputation of the value and the subsequent equality check, if the value is stale (which makes this polling a recursive process as the `computed` is also a consumer which will poll its own producers). If this recomputation produces a semantically changed value, `valueVersion` is incremented.

The consumer can then compare the `valueVersion` of the new value with the one cached in its dependency `ReactiveEdge`, to determine if that particular dependency really did change. By doing this for all producers, the consumer can determine that, if all `valueVersion`s match, that no _actual_ change to any dependency has occurred, and it can skip reacting to that change (e.g. skip running the side effect function).

## `Watch` primitive

`Watch` is a primitive used to build different types of effects. `Watch`es are consumers that run side-effectful functions in their reactive context, but where the scheduling of the side effect is delegated to the implementor. The `Watch` will call this scheduling operation when it receives a notification that it's stale.
