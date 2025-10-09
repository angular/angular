## Effects

Signals are useful because they notify interested consumers when they change. An **effect** is an operation that runs whenever one or more signal values change. You can create an effect with the `effect` function:

```ts
effect(() => {
  console.log(`The current count is: ${count()}`);
});
```

Effects always run **at least once.** When an effect runs, it tracks any signal value reads. Whenever any of these signal values change, the effect runs again. Similar to computed signals, effects keep track of their dependencies dynamically, and only track signals which were read in the most recent execution.

Effects always execute **asynchronously**, during the change detection process.

### Use cases for effects

Effects are rarely needed in most application code, but may be useful in specific circumstances. Here are some examples of situations where an `effect` might be a good solution:

- Logging data being displayed and when it changes, either for analytics or as a debugging tool.
- Keeping data in sync with `window.localStorage`.
- Adding custom DOM behavior that can't be expressed with template syntax.
- Performing custom rendering to a `<canvas>`, charting library, or other third party UI library.

<docs-callout critical title="When not to use effects">
Avoid using effects for propagation of state changes. This can result in `ExpressionChangedAfterItHasBeenChecked` errors, infinite circular updates, or unnecessary change detection cycles.

Instead, use `computed` signals to model state that depends on other state.
</docs-callout>

### Injection context

By default, you can only create an `effect()` within an [injection context](guide/di/dependency-injection-context) (where you have access to the `inject` function). The easiest way to satisfy this requirement is to call `effect` within a component, directive, or service `constructor`:

```ts
@Component({...})
export class EffectiveCounterComponent {
  readonly count = signal(0);
  constructor() {
    // Register a new effect.
    effect(() => {
      console.log(`The count is: ${this.count()}`);
    });
  }
}
```

Alternatively, you can assign the effect to a field (which also gives it a descriptive name).

```ts
@Component({...})
export class EffectiveCounterComponent {
  readonly count = signal(0);

  private loggingEffect = effect(() => {
    console.log(`The count is: ${this.count()}`);
  });
}
```

To create an effect outside the constructor, you can pass an `Injector` to `effect` via its options:

```ts
@Component({...})
export class EffectiveCounterComponent {
  readonly count = signal(0);
  private injector = inject(Injector);

  initializeLogging(): void {
    effect(() => {
      console.log(`The count is: ${this.count()}`);
    }, {injector: this.injector});
  }
}
```

### When to Use (and Not to Use) Effects

Effects are a reactivity primitive, but they are not always the right solution. It's important to understand when to use them and when to reach for other tools like `computed`, `linkedSignal` or `resource`.

#### Good Use Cases for Effects

<!-- TODO -->

#### When to Avoid Effects:

<!-- TODO -->

### Execution of effects

<!-- Root vs View effects -->

### Destroying effects

When you create an effect, it is automatically destroyed when its enclosing context is destroyed. This means that effects created within components are destroyed when the component is destroyed. The same goes for effects within directives, services, etc.

An `effect` can be created in 2 different context that will affect when it's destroyed:

- A "View effect" is created in the context of a component, will be destroyed when the component is destroyed.
- A "Root effect" is created in a root provided service, and if destroyed when the application itself is destroyed.

Effects return an `EffectRef` that you can use to destroy them manually, by calling the `.destroy()` method. You can combine this with the `manualCleanup` option to create an effect that lasts until it is manually destroyed. Be careful to actually clean up such effects when they're no longer required.

### Effect cleanup functions

Effects might start long-running operations, which you should cancel if the effect is destroyed or runs again before the first operation finished. When you create an effect, your function can optionally accept an `onCleanup` function as its first parameter. This `onCleanup` function lets you register a callback that is invoked before the next run of the effect begins, or when the effect is destroyed.

```ts
effect((onCleanup) => {
  const user = currentUser();

  const timer = setTimeout(() => {
    console.log(`1 second ago, the user became ${user}`);
  }, 1000);

  onCleanup(() => {
    clearTimeout(timer);
  });
});
```

## Side effects on DOM elements

The `effect` function is a general-purpose tool for running code in reaction to signal changes. However, it runs _before_ the components are checked and the DOM has been updated. This is great for many use cases, but sometimes you need to run code _after_ the DOM has been updated. For example, you might need to manually inspect or modify the DOM, or integrate a 3rd-party library that requires direct DOM access.

For these situations, you can use `afterRenderEffect`. It functions like `effect`, but runs after Angular has finished rendering and committed its changes to the DOM.

```ts
@Component({/* ... */})
export class MyComponent {
  list = viewChild<ElementRef<HTMLUListElement>>('list');

  constructor() {
    // Re-run after DOM has been updated whenever `items` changes
    afterRenderEffect(() => {
      const el = this.list()?.nativeElement;
      if (el) {
        console.log('List height after render:', el.offsetHeight);
        // ...perform logic based on measured size
      }
    });
  }
}
```

In this example `afterRenderEffect` is used to react on size changes of a child component.

### Render phases

Accessing the DOM and mutating it can impact the performance of your application, for example by triggering to many unecesary [reflows](https://developer.mozilla.org/en-US/docs/Glossary/Reflow).

To optimize those operations, `afterRenderEffect` offers 4 different phases to group the callbacks and execute them in an optimized order.

The phases are:

- `earlyRead`: Use this phase to read from the DOM before a subsequent write callback, for example to perform custom layout that the browser doesn't natively support. Prefer the read phase if reading can wait.
- `write`: Use this phase to write to the DOM. **Never** read from the DOM in this phase.
- `mixedReadWrite`: Use this phase to read from and write to the DOM simultaneously. Never use this phase if it is possible to divide the work among the other phases instead.
- `read`: Use this phase to read from the DOM. **Never** write to the DOM in this phase.

Using these phases helps prevent layout thrashing and ensures that your DOM operations are performed in a safe and efficient manner.

You can specify the phase by passing an object with a `phase` property to `afterRender` or `afterNextRender`:

```ts
afterRenderEffect({
    earlyRead: (cleanupFn) => { /* ... */ },
    write: (previousPhaseValue, cleanupFn) => { /* ... */ },
    mixedReadWrite: (previousPhaseValue, cleanupFn) =>  { /* ... */ },
    read: (previousPhaseValue, cleanupFn) =>  { /* ... */ },
});
```

CRITICAL: If you don't specify the phase for the callback, `afterRenderEffect` will run it during the `mixedReadWrite` phase. By doing so you risk significant performance degradation.

#### Phase executions

The first phase callback to run as part of this spec will receive no parameters. Each subsequent phase callback in this spec will receive the return value of the previously run phase callback as a Signal. This can be used to coordinate work across multiple phases.

Effects run in the following phase order, only when dirty through signal dependencies:

1. `earlyRead`
2. `write`
3. `mixedReadWrite`
4. `read`

If one of the phase hooks dirties itself (by updating a signal it's consuming), the phase will re-run itself.

#### Cleanup

Each phase will provide a cleanupFunction as argument. The cleanup callbacks will be executed when the `afterRenderEffect` is destroyed or before re-running phase effects.

### Server-side rendering caveats

`afterRenderEffect`, similarly to `afterNextRender`/`afterEveryRender`, only runs on the client.

Components are not guaranteed to be [hydrated](/guide/hydration) before the callback runs. You must use caution when directly reading or writing the DOM and layout.
