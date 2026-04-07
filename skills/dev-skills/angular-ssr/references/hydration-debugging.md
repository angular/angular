# Hydration Debugging

## Common Hydration Mismatches

```typescript
// Problem: Different content on server vs client
@Component({
  template: `<p>Current time: {{ currentTime }}</p>`,
})
export class Time {
  // BAD: Different value on server and client
  currentTime = new Date().toLocaleTimeString();
}

// Solution: Use afterNextRender or skip SSR
@Component({
  template: `<p>Current time: {{ currentTime() }}</p>`,
})
export class Time {
  currentTime = signal('');

  constructor() {
    afterNextRender(() => {
      this.currentTime.set(new Date().toLocaleTimeString());
    });
  }
}
```

## Skip Hydration for Dynamic Content

```typescript
@Component({
  template: `
    <!-- Skip hydration for this subtree -->
    <div ngSkipHydration>
      <app-dynamic-widget />
    </div>
  `,
})
export class Page {}
```

## Debug Hydration Issues

```typescript
// Enable hydration debugging in development
import { provideClientHydration, withNoDomReuse } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(
      // Disable DOM reuse to see hydration errors clearly
      ...(isDevMode() ? [withNoDomReuse()] : [])
    ),
  ],
};
```
