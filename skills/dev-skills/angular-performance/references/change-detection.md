# Change Detection Optimization

## OnPush Strategy

Always use `ChangeDetectionStrategy.OnPush` for components:

```typescript
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>{{ user().name }}</h3>
      <p>{{ user().email }}</p>
    </div>
  `
})
export class UserCardComponent {
  user = input.required<User>();
}
```

OnPush triggers change detection only when:
- Input reference changes
- Event originates from component or children
- Async pipe emits
- Signal value changes
- `markForCheck()` is called manually

## Signal-Based Reactivity

Prefer signals over BehaviorSubject for local state:

```typescript
@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubleCount() }}</p>
    <button (click)="increment()">+1</button>
  `
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}
```

## Zone-less Angular

Zone-less is now **default in Angular v21+** - no configuration needed.

For Angular v20, enable it explicitly:

```typescript
// app.config.ts
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // other providers...
  ]
};
```

Requirements for zone-less:
- All components must use OnPush
- Use signals for all reactive state
- Replace setTimeout/setInterval with Angular's alternatives
- Use `afterNextRender` instead of `ngAfterViewInit` for DOM timing
- Ensure `provideZoneChangeDetection` is not used anywhere (would override zoneless)

## Avoiding Common Pitfalls

### Don't call functions in templates

```typescript
// ❌ Bad - function called every change detection
template: `<p>{{ getFullName() }}</p>`

// ✅ Good - computed signal, cached
fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
template: `<p>{{ fullName() }}</p>`
```

### Don't mutate objects directly

```typescript
// ❌ Bad - OnPush won't detect this
this.user.name = 'New Name';

// ✅ Good - new reference triggers detection
this.user.set({ ...this.user(), name: 'New Name' });
```