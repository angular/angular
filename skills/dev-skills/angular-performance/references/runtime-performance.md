# Runtime Performance

## Virtual Scrolling

Use CDK virtual scrolling for large lists:

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items(); trackBy: trackById" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .viewport {
      height: 400px;
      width: 100%;
    }
    .item {
      height: 50px;
    }
  `
})
export class ListComponent {
  items = input.required<Item[]>();

  trackById(index: number, item: Item): string {
    return item.id;
  }
}
```

### Dynamic item sizes

```typescript
@Component({
  template: `
    <cdk-virtual-scroll-viewport
      [itemSize]="50"
      [minBufferPx]="200"
      [maxBufferPx]="400">
      <div *cdkVirtualFor="let item of items()">
        {{ item.content }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
```

## Track By Functions

Always use trackBy with @for:

```typescript
@Component({
  template: `
    @for (user of users(); track user.id) {
      <app-user-card [user]="user" />
    }
  `
})
export class UsersComponent {
  users = input.required<User[]>();
}
```

For complex keys:

```typescript
@Component({
  template: `
    @for (item of items(); track trackItem($index, item)) {
      <app-item [data]="item" />
    }
  `
})
export class ItemsComponent {
  items = input.required<Item[]>();

  trackItem(index: number, item: Item): string {
    return `${item.type}-${item.id}`;
  }
}
```

## Memoization with Computed Signals

Cache expensive calculations:

```typescript
@Component({
  template: `
    <div>Filtered: {{ filteredItems().length }}</div>
    @for (item of filteredItems(); track item.id) {
      <app-item [data]="item" />
    }
  `
})
export class FilteredListComponent {
  items = input.required<Item[]>();
  filter = input<string>('');

  // Computed - only recalculates when items or filter changes
  filteredItems = computed(() => {
    const filterValue = this.filter().toLowerCase();
    return this.items().filter(item =>
      item.name.toLowerCase().includes(filterValue)
    );
  });
}
```

## Avoiding Layout Thrashing

Batch DOM reads and writes:

```typescript
@Component({...})
export class AnimatedComponent {
  #elementRef = inject(ElementRef);

  animate() {
    // ❌ Bad - read/write interleaved causes reflow
    const height = this.#elementRef.nativeElement.offsetHeight;
    this.#elementRef.nativeElement.style.height = height + 10 + 'px';
    const width = this.#elementRef.nativeElement.offsetWidth;
    this.#elementRef.nativeElement.style.width = width + 10 + 'px';

    // ✅ Good - batch reads, then batch writes
    const el = this.#elementRef.nativeElement;
    const height = el.offsetHeight;
    const width = el.offsetWidth;

    requestAnimationFrame(() => {
      el.style.height = height + 10 + 'px';
      el.style.width = width + 10 + 'px';
    });
  }
}
```

## Debouncing User Input

```typescript
@Component({
  template: `
    <input
      [value]="searchTerm()"
      (input)="onSearch($event)"
      placeholder="Search..."
    />
  `
})
export class SearchComponent {
  searchTerm = signal('');
  #searchSubject = new Subject<string>();

  constructor() {
    this.#searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.#performSearch(term);
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.#searchSubject.next(value);
  }

  #performSearch(term: string) {
    // API call or filtering logic
  }
}
```

## Web Workers for Heavy Computation

Offload CPU-intensive work:

```typescript
// heavy-calc.worker.ts
addEventListener('message', ({ data }) => {
  const result = performHeavyCalculation(data);
  postMessage(result);
});

// component.ts
@Component({...})
export class DataProcessorComponent {
  private worker = new Worker(
    new URL('./heavy-calc.worker', import.meta.url)
  );

  processData(data: any[]) {
    this.worker.postMessage(data);
    this.worker.onmessage = ({ data: result }) => {
      this.result.set(result);
    };
  }
}
```