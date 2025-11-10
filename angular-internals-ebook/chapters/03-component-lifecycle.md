# Chapter 3: The Lifecycle Chronicles

> *"When exactly should I load my data?"*

## The Problem

Alex needed to load user data, but wasn't sure where to put the loading logic. Should it go in the constructor? `ngOnInit`? `ngAfterViewInit`? Each seemed to work... sometimes.

## The 8 Lifecycle Hooks

```typescript
// Complete lifecycle order
export class LifecycleComponent implements
  OnChanges, OnInit, DoCheck,
  AfterContentInit, AfterContentChecked,
  AfterViewInit, AfterViewChecked, OnDestroy {

  constructor() { }                      // 0. DI happens here
  ngOnChanges(changes: SimpleChanges) {} // 1. Input changes
  ngOnInit() {}                          // 2. Component initialized
  ngDoCheck() {}                         // 3. Custom change detection
  ngAfterContentInit() {}                // 4. Content children ready
  ngAfterContentChecked() {}             // 5. Content checked
  ngAfterViewInit() {}                   // 6. View children ready
  ngAfterViewChecked() {}                // 7. View checked
  ngOnDestroy() {}                       // 8. Cleanup
}
```

## When to Use Each Hook

### Constructor: DI Only
```typescript
constructor(private service: MyService) {
  // ✅ Dependency injection
  // ❌ Don't access @Input() here (not set yet!)
  // ❌ Don't access ViewChild (not available yet!)
}
```

### ngOnInit: Data Loading
```typescript
ngOnInit() {
  // ✅ Load data from services
  // ✅ Initialize component state
  // ✅ @Input() values are available
  this.loadData();
}
```

### ngAfterViewInit: DOM Access
```typescript
@ViewChild('canvas') canvas!: ElementRef;

ngAfterViewInit() {
  // ✅ Access ViewChild/ViewChildren
  // ✅ Direct DOM manipulation
  const ctx = this.canvas.nativeElement.getContext('2d');
}
```

## The Deep Dive

See source code in `packages/core/src/render3/interfaces/lifecycle_hooks.ts` for complete implementation details.

**[Continue to Chapter 4: The Rendering Engine →](04-rendering-engine.md)**
