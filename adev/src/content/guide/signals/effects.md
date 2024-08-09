# Effects

Signals track values as they change. When signals are used in a template, Angular reacts handles these changes and updates the UI. Sometimes, however, you need to programatically perform an action when a signal changes. Common actions include logging data, updating a cache, or making a network request. For tasks like this, you can create an effect.

An effect is a **function** which runs

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

### Anti-patterns with effects

```

```

```

```
