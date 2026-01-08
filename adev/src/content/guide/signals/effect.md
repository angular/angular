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

Effects should be the last API you reach for. Always prefer `computed()` for derived values and `linkedSignal()` for values that can be both derived and manually set. If you find yourself copying data from one signal to another with an effect, it's a sign you should move your source-of-truth higher up and use `computed()` or `linkedSignal()` instead. Effects are best for syncing signal state to imperative, non-signal APIs.

TIP: There are no situations where effect is good, only situations where it is appropriate.

- Logging signal values, either for analytics or as a debugging tool.
- Keeping data in sync with different kind of storages: `window.localStorage`, session storage, cookies etc.
- Adding custom DOM behavior that can't be expressed with template syntax.
- Performing custom rendering to a `<canvas>` element, charting library, or other third party UI library.

<docs-callout critical title="When not to use effects">
Avoid using effects for propagation of state changes. This can result in `ExpressionChangedAfterItHasBeenChecked` errors, infinite circular updates, or unnecessary change detection cycles.

Instead, use `computed` signals to model state that depends on other state.
</docs-callout>

### Injection context

By default, you can only create an `effect()` within an [injection context](guide/di/dependency-injection-context) (where you have access to the `inject` function). The easiest way to satisfy this requirement is to call `effect` within a component, directive, or service `constructor`:

```ts
@Component({
  /*...*/
})
export class EffectiveCounter {
  readonly count = signal(0);

  constructor() {
    // Register a new effect.
    effect(() => {
      console.log(`The count is: ${this.count()}`);
    });
  }
}
```

To create an effect outside the constructor, you can pass an `Injector` to `effect` via its options:

```ts
@Component({
  /*...*/
})
export class EffectiveCounterComponent {
  readonly count = signal(0);
  private injector = inject(Injector);

  initializeLogging(): void {
    effect(
      () => {
        console.log(`The count is: ${this.count()}`);
      },
      {injector: this.injector},
    );
  }
}
```

### Execution of effects

Angular implicitly defines two implicit behaviors for its effects depending on the context they were created in.

A "View Effect" is an `effect` created in the context of a component instantiation. This includes effects created by services that are tied to component injectors.<br>
A "Root Effect" is created in the context of a root provided service instantiation.

The execution of both kinds of `effect` are tied to the change detection process.

- "View effects" are executed _before_ their corresponding component is checked by the change detection process.
- "Root effects" are executed prior to all components being checked by the change detection process.

In both cases, if at least one of the effect dependencies changed during the effect execution, the effect will re-run before moving ahead on the change detection process,

### Destroying effects

When a component or directive is destroyed, Angular automatically cleans up any associated effects.

An `effect` can be created in two different contexts that will affect when it's destroyed:

- A "View effect" is destroyed when the component is destroyed.
- A "Root effect" is destroyed when the application is destroyed.

Effects return an `EffectRef`. You can use the ref's `destroy` method to manually dispose of an effect. You can combine this with the `manualCleanup` option when creating an effect to disable automatic cleanup. Be careful to actually destroy such effects when they're no longer required.

### Effect cleanup functions

When a component or directive is destroyed, Angular automatically cleans up any associated effects.
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

The `effect` function is a general-purpose tool for running code in reaction to signal changes. However, it runs _before_ the Angular updates the DOM. In some situations, you may need to manually inspect or modify the DOM, or integrate a 3rd-party library that requires direct DOM access.

For these situations, you can use `afterRenderEffect`. It functions like `effect`, but runs after Angular has finished rendering and committed its changes to the DOM.

```ts
@Component({
  /*...*/
})
export class MyFancyChart {
  chartData = input.required<ChartData>();
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  chart: ChartInstance;

  constructor() {
    // Run a single time to create the chart instance
    afterNextRender({
      write: () => {
        this.chart = initializeChart(this.canvas().nativeElement(), this.charData());
      },
    });

    // Re-run after DOM has been updated whenever `chartData` changes
    afterRenderEffect(() => {
      this.chart.updateData(this.chartData());
    });
  }
}
```

In this example `afterRenderEffect` is used to update a chart created by a 3rd party library.

TIP: You often don't need `afterRenderEffect` to check for DOM changes. APIs like `ResizeObserver`, `MutationObserver` and `IntersectionObserver` are preferred to `effect` or `afterRenderEffect` when possible.

### Render phases

Accessing the DOM and mutating it can impact the performance of your application, for example by triggering too many unnecessary [reflows](https://developer.mozilla.org/en-US/docs/Glossary/Reflow).

To optimize those operations, `afterRenderEffect` offers four phases to group the callbacks and execute them in an optimized order.

The phases are:

| Phase            | Description                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `earlyRead`      | Use this phase to read from the DOM before a subsequent write callback, for example to perform custom layout that the browser doesn't natively support. Prefer the read phase if reading can wait. |
| `write`          | Use this phase to write to the DOM. **Never** read from the DOM in this phase.                                                                                                                     |
| `mixedReadWrite` | Use this phase to read from and write to the DOM simultaneously. Never use this phase if it is possible to divide the work among the other phases instead.                                         |
| `read`           | Use this phase to read from the DOM. **Never** write to the DOM in this phase.                                                                                                                     |

Using these phases helps prevent layout thrashing and ensures that your DOM operations are performed in a safe and efficient manner.

You can specify the phase by passing an object with a `phase` property to `afterRender` or `afterNextRender`:

```ts
afterRenderEffect({
  earlyRead: (cleanupFn) => {
    /* ... */
  },
  write: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
  mixedReadWrite: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
  read: (previousPhaseValue, cleanupFn) => {
    /* ... */
  },
});
```

CRITICAL: If you don't specify the phase, `afterRenderEffect` runs callbacks during the `mixedReadWrite` phase. This may worsen application performance by causing additional DOM reflows.

#### Phase executions

The `earlyRead` phase callback receives no parameters. Each subsequent phase receives the return value of the previous phase's callback as a Signal. You can use this to coordinate work across phases.

Effects run in the following phase order:

1. `earlyRead`
2. `write`
3. `mixedReadWrite`
4. `read`

If one of the phases modifies a signal value tracked by `afterRenderEffect`, the affected phases execute again.

#### Cleanup

Each phase provides a cleanup callback function as argument. The cleanup callbacks are executed when the `afterRenderEffect` is destroyed or before re-running phase effects.

### Server-side rendering caveats

`afterRenderEffect`, similarly to `afterNextRender`/`afterEveryRender`, only runs on the client.

NOTE: Components are not guaranteed to be [hydrated](/guide/hydration) before the callback runs. You must use caution when directly reading or writing the DOM and layout.
