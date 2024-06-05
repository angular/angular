# Effects

Signals track values as they change. When signals are used in a template, Angular reacts handles these changes and updates the UI. Sometimes, however, you need to programatically perform an action when a signal changes. Common actions include logging data, updating a cache, or making a network request. For tasks like this, you can create an effect.

An effect is a **function** which performs an action based on the values of some signals, which re-runs whenever those signals are updated.

Effects are created with the `effect()` API, which accepts a function describing the action to take. Like with `computed` signals, effects keep track of which signals are read during their execution. Angular will automatically schedule effects to rerun if the signals they read are updated.

Effects provide a more declarative way to express reactions to state changes. With effects, you describe the desired side effect operation in terms of the current state, rather than explicitly specifying how to react to each state change. This leads to code that is easier to read and reason about, focusing on the "what" rather than the "how" or "when" of reactivity.

For example, an effect can be used to propagate a signal's value into `localStorage`:

```ts
const CACHE_KEY = 'name';
const name = signal('Alex');

// Create an effect to update local storage every time the name changes.
effect(() => {
  window.localStorage.setItem(CACHE_KEY, name());
});
```

The `effect()` function expects to be called within an [injection context](/guide/di/dependency-injection-context), such as during the construction of a component or service. This context also determines the scope and lifecycle of the effect (see: "when do effects run?" below). Effects register themselves to be cleaned up with their injected context.

If an effect needs to be created outside of injection context, an `Injector` can be passed manually. Be sure to pass an appropriate injector for the lifetime of the effect.

## When do effects run?

Angular effects run during the "synchronization" process which is driven either by Angular's built-in scheduler or by zone.js (if zone-based change detection is active). Effects are run according to their location within the component tree. An effect created within a directive runs after the directive's inputs are set and before any child view(s) are checked. If an effect is created outside of the component tree (for example, in a root service), it runs at the beginning of synchronization, before any components.

<docs-callout helpful title="Effects are asynchronous">
Effects are never synchronous - they don't run immediately when one of their signal dependencies changes. Instead, their executions are scheduled by the framework to run at an optimal time in the future.
</docs-callout>

## Testing effects

When testing components which use effects internally, you can rely on Angular running those effects using the same scheduling mechanism it does in the production application. For example, this `PageComponent` has an `effect` which sets `document.title` to the value of an input signal:

```ts
@Component({...})
export class PageComponent {
  title = input.required<string>();

  constructor() {
    effect(() => document.title = this.title());
  }
}
```

A test of this effect looks very similar to a typical component unit test:

```ts
it('should update document.title', async () => {
  const fix = TestBed.createComponent(PageComponent);
  fix.setInput('title', 'Page Title');

  // Await synchronization, which includes both UI rendering and effects.
  await fix.whenStable();

  expect(document.title).toBe('Page Title');
});
```

It's also possible to use effects in plain services, outside of any components. `TestBed`'s APIs can be used to test those effects too. For example, suppose the above logic was in `TitleService` instead of a component. The test is very similar, except instead of `ComponentFixture.whenStable`, we use `ApplicationRef.whenStable()` instead:

```ts
it('should update document.title', async () => {
  const appRef = TestBed.inject(ApplicationRef);

  const svc = TestBed.inject(TitleService);
  svc.title.set('Page Title');

  // Await synchronization, which waits for any effect(s) to run.
  await appRef.whenStable();

  expect(document.title).toBe('Page Title');
});
```

### Creating effects in tests

Occasionally it's useful to create dedicated `effect`s in tests. Such effects will execute at the beginning of synchronization, prior to effects in the component tree. Since `effect` requires injection context, using it requires either passing an `Injector` or using `TestBed.runInInjectionContext`. This example uses an effect to log the value of a `StateService.name` signal at a few points:

```ts
it('should capture name changes', () => {
  const appRef = TestBed.inject(ApplicationRef);
  const state = TestBed.inject(StateService);

  let names: string[] = [];
  TestBed.runInInjectionContext(() => {
    effect(() => {
      names.push(state.name());
    });
  });

  state.setData({name: 'Pawel'});
  await appRef.whenStable();

  state.setData({name: 'Alex'});
  await appRef.whenStable();

  expect(names).toEqual(['Pawel', 'Alex']);
});
```

## Advanced Topics

### `untracked` in effects

While the examples in this doc largely focus on effects which perform direct actions, that's not always the case. Sometimes effects are used to drive other logic in an application, such as dispatching state management actions or broadcasting events to components. Since such effects commonly run business logic, it's useful to think of them as _business effects_. In general, effects which implement the subscriber pattern ("subscribe to X and do Y when it changes") are business effects.

When writing business effects, use `untracked` to separate reading signals which trigger the effect from the action taken with the value of those signals. This ensures that any signals the business logic might incidentally read don't end up tracked by the effect as well.

For example, this business effect feeds an RxJS `Subject` with the value of an input signal:

```ts
@Component({...})
export class UserProfile {
  userId = input.required<number>();

  userIdChanges = new Subject<number>();

  constructor() {
    effect(() => {
      // The signal is read inside the effect, which tracks it.
      const currentId = this.userId();

      // .next() is called in an untracked context
      untracked(() => {
        this.userIdChanges.next(currentId);
      });
    });
  }
}
```

Calling `.next()` in an `untracked` context ensures that if a subscriber incidentally reads a signal, it won't accidentally end up tracked in an effect. This separation between tracked dependencies and an untracked reaction is characteristic of business effects.

### Why are effects not synchronous?

If you have experience with other systems which propagate synchronously (such as RxJS) it can be surprising that setting a signal does not immediately run any effects which depend on it. That is, this code:

```ts
const counter = signal(0);
effect(() => console.log(counter()));
counter.set(1);
counter.set(2);
```

will only log a single value (2). In fact, any given signal may update many times before any effects which depend on it are re-executed.

There are two primary reasons for this: _safety_ and _performance_.

Effects don't just run when a signal changes, they wait until the entire signal graph is in a consistent state. For example, when updating multiple signals back-to-back, you don't have to be concerned with effects running in between each update and observing inconsistent states. 

```ts
selectedUser.set(1);
users.set([user1, user2]);
```

In this example, if an effect tried to access `users()[selectedUser()]` before `users` was updated, it might get `undefined`. While these two operations could be easily switched, it's not always straightforward or possible to update different signals while ensuring the intermediate states are logically consistent. Running effects asynchronously ensures that the effect function always receives the final, logically consistent values of all signals it reads, even when reading a signal for the first time.

Secondly, Angular runs effects asynchronously in order to avoid running effects unnecessarily, with values that end up overwritten later. This batching is an effective performance optimization, especially for effects which perform more intensive operations such as creating or destroying DOM.

### Anti-patterns with effects

Effects are a very flexible tool and it's often tempting to reach for them as the solution to many problems. However, they are not without downsides, and can introduce significant complexity when simpler and more maintainable solutions exist. In fact, effects tend to be rare in application code.

* Consider whether a `computed` could be used instead.

This code keeps a `fullName` signal in sync with `firstName` and `lastName` inputs:

```ts
firstName = input.required<string>();
lastName = input.required<string>();
fullName = signal('');

constructor() {
  effect(() => {
    this.fullName.set(this.firstName() + ' ' + this.lastName());
  });
}
```

However, `fullName` would be much more cleanly expressed as a `computed`:

```ts
fullName = computed(() => this.firstName() + ' ' + this.lastName());
```

Often this is the case for effects which are attempting to "synchronize" one source of truth with another. In such cases, consider whether one of the sources can be converted to a derivation of the other instead. Using an effect for such synchronization introduces complexity, as there will be a period of time between updating one of the inputs and the effect running where the derived value is logically out-of-sync.

* When there's a clear relationship between cause and a side-effect, consider expressing this directly instead of using an `effect()`

For example, consider a UI which shows a "next page" button that when clicked, increments a page counter and resets the current index. We could express this logic with an `effect()`:

```ts
page = signal(0);
index = signal(0);

constructor() {
  effect(() => {
    this.page();       // run the effect when the `page` signal changes
    this.index.set(0); // reset the `index` signal to 0
  });
}

onClickNextPage(): void {
  this.page.update(page => page + 1);
}
```

Instead, since the relationship between navigating to the next page and resetting the index is clear, this logic can be expressed much more directly:

```ts
onClickNextPage(): void {
  this.page.update(page => page + 1);
  this.index.set(0);
}
```

In addition to being more readable and debuggable, structuring the logic this way ensures that the state is  always self-consistent. With the effect, there is a period of time where `page` is updated but `index` is not.