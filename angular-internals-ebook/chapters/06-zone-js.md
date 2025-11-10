# Chapter 6: Zone.js and the Async World

> *"How does Angular track async operations?"*

## What Zone.js Does

Zone.js **patches** all async APIs to track execution context:

```typescript
// Before Zone.js
setTimeout(() => {
  console.log('Timer fired');
}, 1000);

// After Zone.js (invisible patching)
setTimeout(() => {
  // Zone.js wraps this callback
  zone.run(() => {
    console.log('Timer fired');
    triggerChangeDetection(); // ← Automatic!
  });
}, 1000);
```

## Patched APIs

- `setTimeout` / `setInterval`
- `Promise`
- `XMLHttpRequest` / `fetch`
- `EventTarget.addEventListener`
- `MutationObserver`
- `requestAnimationFrame`

## NgZone API

```typescript
import { Component, NgZone } from '@angular/core';

@Component({...})
export class MyComponent {
  constructor(private ngZone: NgZone) {}

  // Run inside zone → triggers CD
  runInside() {
    this.ngZone.run(() => {
      // Heavy work
      this.data = newData;
    }); // ← CD triggered here
  }

  // Run outside zone → no CD
  runOutside() {
    this.ngZone.runOutsideAngular(() => {
      // Heavy animation loop
      requestAnimationFrame(() => {
        // This won't trigger CD!
      });
    });
  }
}
```

## When to Escape Zone

- Heavy animations
- Third-party libraries
- Polling/timers that don't need CD
- WebSocket streams

**[Continue to Chapter 7: Signals →](07-signals.md)**
