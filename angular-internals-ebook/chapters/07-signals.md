# Chapter 7: Signals - The New Reactivity

> *"Is there a better way than RxJS for everything?"*

## The Reactive Graph

Signals create a **dependency graph** automatically:

```typescript
import { signal, computed, effect } from '@angular/core';

// Create signals
const count = signal(0);
const multiplier = signal(2);

// Computed signal (auto-tracks dependencies)
const doubled = computed(() => count() * multiplier());

// Effect (runs when dependencies change)
effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// Update signals
count.set(5);        // Logs: "Count: 5, Doubled: 10"
multiplier.set(3);   // Logs: "Count: 5, Doubled: 15"
```

## The Algorithm

```typescript
// Simplified from packages/core/primitives/signals/src/

interface ReactiveNode {
  version: number;           // Current version
  producers: ReactiveNode[]; // Dependencies
  consumers: ReactiveNode[]; // Dependents
  value: any;               // Cached value
  dirty: boolean;           // Needs recomputation
}

function readSignal(node: ReactiveNode): any {
  // Track as dependency of current consumer
  if (activeConsumer) {
    node.consumers.push(activeConsumer);
    activeConsumer.producers.push(node);
  }

  return node.value;
}

function writeSignal(node: ReactiveNode, newValue: any): void {
  if (node.value === newValue) return; // No change

  node.value = newValue;
  node.version++;

  // Mark all consumers as dirty
  for (const consumer of node.consumers) {
    markDirty(consumer);
  }
}

function computedSignal(fn: () => any): ReactiveNode {
  const node: ReactiveNode = {
    version: 0,
    producers: [],
    consumers: [],
    value: undefined,
    dirty: true
  };

  node.get = () => {
    if (node.dirty) {
      // Recompute
      const prevConsumer = activeConsumer;
      activeConsumer = node;

      node.value = fn(); // ← Tracks dependencies automatically!

      activeConsumer = prevConsumer;
      node.dirty = false;
    }

    return readSignal(node);
  };

  return node;
}
```

## Signals vs RxJS

| Feature | Signals | RxJS |
|---------|---------|------|
| Sync/Async | Synchronous | Asynchronous |
| Subscriptions | Automatic | Manual subscribe/unsubscribe |
| Memory | Minimal | Can leak if not unsubscribed |
| Learning curve | Simple | Complex |
| Use case | Local state | Async operations, events |

## Best Practices

```typescript
// ✅ Use signals for local state
class MyComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(n => n + 1);
  }
}

// ✅ Use RxJS for async operations
class DataComponent {
  private dataSignal = signal<Data[]>([]);
  data = this.dataSignal.asReadonly();

  constructor(http: HttpClient) {
    http.get<Data[]>('/api/data').subscribe(data => {
      this.dataSignal.set(data);
    });
  }
}

// ✅ Combine both
class SmartComponent {
  filter = signal('all');

  private data$ = this.http.get<Data[]>('/api/data');

  filteredData = toSignal(
    this.data$.pipe(
      map(data => data.filter(d => this.applyFilter(d, this.filter())))
    )
  );
}
```

**[Continue to Chapter 8: Router Internals →](08-router.md)**
