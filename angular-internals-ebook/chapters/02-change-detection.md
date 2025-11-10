# Chapter 2: The Change Detection Enigma

> *"I clicked the button, but the UI didn't update!"*

## The Problem

Fresh from the dependency injection victory, Alex felt confident. The next task seemed straightforward: build a real-time dashboard showing live order updates.

Alex created a component that fetched data every second:

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h2>Live Orders: {{ orders.length }}</h2>
      <div *ngFor="let order of orders">
        {{ order.id }} - {{ order.status }}
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    // Poll for updates using native setInterval
    setInterval(() => {
      this.orderService.getOrders().subscribe(orders => {
        this.orders = orders;
        console.log('Orders updated:', orders.length); // Logs correctly!
      });
    }, 1000);
  }
}
```

The console showed orders updating every second. Perfect! But the UI... didn't change. The display showed "Live Orders: 0" and never updated.

**"The data is updating, but the view isn't!"** Alex was baffled.

Then Alex tried something: clicking anywhere on the page. Suddenly, the UI updated with all the pending changes.

*"What? Clicks trigger updates, but data changes don't?"*

## The Investigation

This mystery led Alex deep into Angular's change detection system.

### Discovery 1: Change Detection Runs on Events

Alex found the answer in `packages/core/src/change_detection/`:

```typescript
// packages/core/src/render3/instructions/change_detection.ts

/**
 * Marks the view as dirty (needing check) and schedules change detection
 */
export function markViewDirty(lView: LView): void {
  while (lView) {
    lView[FLAGS] |= LViewFlags.Dirty;

    const parent = lView[PARENT];
    if (parent === null) {
      // Reached root, schedule tick
      scheduleTick(lView);
      return;
    }
    lView = parent;
  }
}

/**
 * The main change detection function
 */
export function detectChanges(component: {}): void {
  const lView = getComponentLViewByIndex(getComponentDef(component)!.id, getLView());
  detectChangesInternal(lView, component);
}
```

💡 **Key Insight #1**: Change detection doesn't run automatically - something must trigger it!

### Discovery 2: Zone.js Patches Async Operations

Alex discovered that Angular uses **Zone.js** to automatically trigger change detection:

```typescript
// Simplified from zone.js/lib/zone.ts

class NgZone {
  run<T>(fn: () => T): T {
    // Run function inside Angular zone
    return this._inner.run(() => {
      const result = fn();

      // After function completes, trigger change detection
      this.onMicrotaskEmpty.emit();

      return result;
    });
  }

  runOutsideAngular<T>(fn: () => T): T {
    // Run without triggering change detection
    return this._outer.run(fn);
  }
}
```

Zone.js patches all async APIs:
- `setTimeout` / `setInterval`
- `Promise`
- `XMLHttpRequest` / `fetch`
- `addEventListener`

When these complete, Zone.js notifies Angular to run change detection.

But here's the catch: **Alex's code wasn't running in the Angular zone!**

## The Solution

The fix was simple - run the interval inside Angular's zone:

```typescript
import { Component, OnInit, NgZone } from '@angular/core';

@Component({...})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private ngZone: NgZone  // Inject NgZone
  ) {}

  ngOnInit() {
    // Option 1: Use Angular's zone
    this.ngZone.run(() => {
      setInterval(() => {
        this.orderService.getOrders().subscribe(orders => {
          this.orders = orders;
        });
      }, 1000);
    });

    // Option 2: Manually trigger change detection
    setInterval(() => {
      this.orderService.getOrders().subscribe(orders => {
        this.orders = orders;
        this.ngZone.run(() => {}); // Force CD
      });
    }, 1000);

    // Option 3: Use RxJS timer (automatically in zone)
    timer(0, 1000)
      .pipe(switchMap(() => this.orderService.getOrders()))
      .subscribe(orders => {
        this.orders = orders;
      });
  }
}
```

But why did clicking update the UI? **Because click events are automatically patched by Zone.js!**

## The Deep Dive: How Change Detection Works

Now Alex wanted to understand the complete mechanism.

### The Change Detection Tree

Every component has a **change detector** that checks if its bindings have changed:

```
┌─────────────────┐
│   AppComponent  │  ← Root
│   CD: Default   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴────┐ ┌─┴──────┐
│Dashboard│ │ Sidebar│
│Default  │ │ OnPush │
└───┬────┘ └────────┘
    │
┌───┴──────┐
│OrderCard │
│  OnPush  │
└──────────┘
```

### The Algorithm

```typescript
// Simplified from render3/instructions/change_detection.ts

function detectChangesInView(
  lView: LView,
  mode: ChangeDetectionMode
): void {
  const tView = lView[TVIEW];
  const flags = lView[FLAGS];

  // Skip if:
  // - View is destroyed
  // - View is detached
  // - View is OnPush and not dirty
  if (
    flags & LViewFlags.Destroyed ||
    flags & LViewFlags.Detached ||
    (mode === ChangeDetectionMode.OnPush && !(flags & LViewFlags.Dirty))
  ) {
    return;
  }

  // Mark as checking
  lView[FLAGS] &= ~LViewFlags.Dirty;
  lView[FLAGS] |= LViewFlags.CheckAlways;

  // Refresh the view (run template function)
  refreshView(tView, lView, tView.template, lView[CONTEXT]);

  // Check children
  const components = tView.components;
  if (components !== null) {
    for (let i = 0; i < components.length; i++) {
      const componentIndex = components[i];
      const componentView = getComponentLViewByIndex(componentIndex, lView);
      detectChangesInView(componentView, mode);
    }
  }
}
```

💡 **Key Insight #2**: Change detection traverses the component tree from top to bottom!

### Change Detection Strategies

Angular offers two strategies:

```typescript
// packages/core/src/change_detection/constants.ts

export enum ChangeDetectionStrategy {
  /**
   * Check the view whenever triggered (default)
   * Runs on every async event
   */
  Default = 1,

  /**
   * Only check when:
   * - @Input() changes
   * - Component emits event
   * - Manually triggered via markForCheck()
   */
  OnPush = 0
}
```

#### Default Strategy

```typescript
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.Default, // Default
  template: `
    <div *ngFor="let user of users">
      {{ user.name }} - {{ user.status }}
    </div>
  `
})
export class UserListComponent {
  users: User[] = [];

  constructor(private userService: UserService) {
    // This will trigger CD
    setInterval(() => {
      this.userService.getUsers().subscribe(users => {
        this.users = users; // View updates automatically
      });
    }, 1000);
  }
}
```

Every async operation triggers change detection for **all Default components**.

#### OnPush Strategy

```typescript
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      {{ user.name }} - {{ user.status }}
      <button (click)="toggleStatus()">Toggle</button>
    </div>
  `
})
export class UserCardComponent {
  @Input() user!: User;

  toggleStatus() {
    // ❌ Won't update view!
    this.user.status = this.user.status === 'active' ? 'inactive' : 'active';

    // ✅ This works - new object reference
    this.user = { ...this.user, status: this.user.status === 'active' ? 'inactive' : 'active' };
  }
}
```

OnPush only checks when:
1. **@Input() reference changes** (not deep equality!)
2. **Event handler in template runs**
3. **Async pipe emits new value**
4. **Manually marked via ChangeDetectorRef.markForCheck()**

### View Flags

Alex discovered that change detection uses **bit flags** to track state:

```typescript
// packages/core/src/render3/interfaces/view.ts

export const enum LViewFlags {
  /** Whether view needs check */
  Dirty = 0b00000001,

  /** View is attached to CD tree */
  Attached = 0b00000010,

  /** View has been destroyed */
  Destroyed = 0b00000100,

  /** First check hasn't run */
  FirstCheck = 0b00001000,

  /** View uses OnPush */
  CheckAlways = 0b00010000,

  // ... more flags
}
```

These flags determine if a view should be checked:

```typescript
function shouldCheckView(lView: LView): boolean {
  const flags = lView[FLAGS];

  return (
    !(flags & LViewFlags.Destroyed) &&  // Not destroyed
    (flags & LViewFlags.Attached) &&     // Attached to tree
    (flags & LViewFlags.Dirty ||         // Marked dirty OR
     flags & LViewFlags.CheckAlways)     // Always check (Default strategy)
  );
}
```

## Performance Optimization

Armed with this knowledge, Alex optimized the dashboard:

### Before: Slow (Everything Default)

```typescript
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <app-order-card *ngFor="let order of orders" [order]="order"></app-order-card>
  `
})
export class DashboardComponent {
  orders: Order[] = [];

  ngOnInit() {
    // Triggers CD for entire tree every second!
    interval(1000)
      .pipe(switchMap(() => this.orderService.getOrders()))
      .subscribe(orders => {
        this.orders = orders;
      });
  }
}
```

**Problem**: Every second, change detection runs on dashboard + all child components, even if data hasn't changed!

### After: Fast (OnPush Everywhere)

```typescript
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-order-card
      *ngFor="let order of orders; trackBy: trackByOrderId"
      [order]="order">
    </app-order-card>
  `
})
export class DashboardComponent {
  orders: Order[] = [];

  ngOnInit() {
    interval(1000)
      .pipe(
        switchMap(() => this.orderService.getOrders()),
        // Only emit if data actually changed
        distinctUntilChanged((prev, curr) =>
          JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(orders => {
        // Create new array reference for OnPush
        this.orders = [...orders];
      });
  }

  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }
}

@Component({
  selector: 'app-order-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      {{ order.id }} - {{ order.status }}
    </div>
  `
})
export class OrderCardComponent {
  @Input() order!: Order;
}
```

**Result**: 10x faster! Change detection only runs when data actually changes, and only checks components that need it.

### Using ChangeDetectorRef

For manual control:

```typescript
import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-manual-cd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ count }}</div>`
})
export class ManualCDComponent {
  count = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  increment() {
    this.count++;

    // Option 1: Mark this view and ancestors as dirty
    this.cdr.markForCheck();

    // Option 2: Run CD immediately (sync)
    this.cdr.detectChanges();

    // Option 3: Detach from CD (manual mode)
    this.cdr.detach();
    // Later: this.cdr.reattach();
  }
}
```

## Real-World Example: Optimized Real-Time Dashboard

See complete code in `code-examples/02-change-detection/`:

```typescript
// Real-time dashboard with optimized CD
@Component({
  selector: 'app-optimized-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Orders: {{ (orders$ | async)?.length }}</h2>
    <app-order-list [orders]="orders$ | async"></app-order-list>
  `
})
export class OptimizedDashboardComponent {
  orders$ = interval(1000).pipe(
    switchMap(() => this.orderService.getOrders()),
    shareReplay(1)
  );
}
```

Using `async` pipe:
- ✅ Automatically subscribes/unsubscribes
- ✅ Calls `markForCheck()` on new values
- ✅ Works perfectly with OnPush

## Key Takeaways

1. **Change Detection is a Tree Traversal** - Angular checks components top-to-bottom

2. **Zone.js Triggers CD** - Async operations automatically trigger change detection

3. **OnPush is Your Friend** - Massive performance gains with minimal effort

4. **Immutability Matters** - OnPush requires new object references

5. **Use Async Pipe** - Handles subscriptions and CD automatically

6. **Manual Control Available** - ChangeDetectorRef for advanced cases

## Next Chapter

Understanding change detection solved Alex's performance problems. But new questions emerged:

- *When exactly do lifecycle hooks run?*
- *What's the difference between OnInit and AfterViewInit?*
- *When should I load data?*

Next: [Chapter 3: The Lifecycle Chronicles](03-component-lifecycle.md)

## Further Reading

- Source: `packages/core/src/change_detection/`
- Source: `packages/core/src/render3/instructions/change_detection.ts`
- Zone.js: `packages/zone.js/`
- Documentation: https://angular.dev/guide/change-detection

## Notes from Alex's Journal

*"Mind blown. Change detection isn't magic - it's just tree traversal with Zone.js! OnPush strategy makes so much sense now. Can't believe I didn't use it before.*

*The key: immutability + OnPush = fast apps. Simple.*

*Next: figure out lifecycle hooks. When exactly does ngOnInit run vs ngAfterViewInit?"*
