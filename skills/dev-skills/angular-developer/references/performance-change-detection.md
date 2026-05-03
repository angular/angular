# Change Detection Performance

Change detection determines when Angular updates the DOM. From Angular v22, `OnPush` is the default strategy — components re-render only when their inputs change, a signal they read updates, or an event fires within them. In earlier versions the default strategy checks the entire component tree on every event. The following approaches reduce change detection cost in all versions.

## OnPush Strategy

`OnPush` tells Angular to skip a component during change detection unless:

- One of its `@Input` references changes
- An event originates from within the component or its children
- An `async` pipe emits a new value
- A signal read within the template changes value

```ts
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ user().name }}</p>`
})
export class UserCard {
  user = input.required<User>();
}
```

**Use `OnPush` on every component.** From v22, it is the default for new components. In earlier versions it must be set explicitly. The default strategy runs a full tree check on every browser event — `OnPush` makes Angular skip subtrees that cannot have changed.

## Signals + OnPush

Signals read inside an `OnPush` component's template automatically schedule targeted re-renders when they change — no `markForCheck()` needed.

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Count: {{ count() }}</p>`
})
export class Counter {
  count = signal(0);
  increment() { this.count.update(v => v + 1); }
}
```

Do not call `markForCheck()` in signal-based components. Signals handle scheduling internally.

## NgZone.runOutsideAngular()

> **Zone-based apps only.** Angular v21+ apps are zoneless by default — zone.js is not included and `NgZone` is a no-op. This pattern applies to apps on v20 or earlier, or apps that explicitly opted into zone.js.

Angular's zone.js patches browser APIs (setTimeout, addEventListener, etc.) and triggers change detection after every callback. Code that does not produce UI changes should run outside the zone.

```ts
@Component({ ... })
export class MapComponent implements AfterViewInit {
  private ngZone = inject(NgZone);

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      // Map library fires thousands of events — none should trigger Angular CD
      this.map.on('mousemove', (e) => this.updateCoordinates(e));
    });
  }

  private updateCoordinates(e: MouseEvent) {
    // Update a raw property, not a signal — if signals are needed,
    // re-enter the zone explicitly for that update only
    this.coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
  }
}
```

Use `runOutsideAngular` for: map libraries, WebGL/canvas animation loops, third-party charting libraries, WebSocket message handlers that batch updates.

## Zoneless Angular

Zoneless mode removes zone.js entirely. Angular relies purely on signals and explicit scheduling to know when to update the DOM.

**From Angular v21, zoneless is the default for new projects.** Zone.js is not included unless explicitly added back via `provideZoneChangeDetection()`.

For apps on Angular v20 or earlier, opt in explicitly:

```ts
// app.config.ts (v20 and earlier)
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
};
```

Remove `zone.js` from `polyfills` in `angular.json` when opting in on older versions.

**Benefits**: Smaller bundle (~12 KB removed), faster initial parse, no accidental change detection from third-party code, better SSR compatibility.

**Migration path from zone.js** (for apps upgrading from v20 or earlier):
1. Enable `provideExperimentalZonelessChangeDetection()` alongside `provideZoneChangeDetection()` during transition
2. Audit all components for manual `detectChanges()` or `markForCheck()` calls — replace with signals
3. Ensure all async state flows through signals or `AsyncPipe`
4. Remove zone.js once all components pass tests in zoneless mode

## Angular DevTools — Change Detection Profiler

The Angular DevTools browser extension includes a change detection profiler. Use it to:

- Identify which components check most frequently
- Find components with Default strategy that should use OnPush
- Measure the milliseconds spent in each CD cycle

Install: Chrome Web Store → "Angular DevTools"

## Anti-Patterns

**Default change detection in signal-based components.** The default strategy runs a full tree traversal even when only a single signal changes. OnPush + signals means only the affected component re-renders.

**Calling `markForCheck()` in signal components.** Signals schedule their own updates. Manual `markForCheck()` is redundant and can mask missing signal reads.

**Running animation loops inside the zone (zone-based apps).** `requestAnimationFrame` loops inside Angular's zone trigger change detection at 60fps. Always wrap animation code in `runOutsideAngular()`. In zoneless apps (default from v21) this is not an issue.
