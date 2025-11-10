# Angular Internals: Complete File Index and Code Patterns

## FILE REFERENCE INDEX

### 1. DEPENDENCY INJECTION SYSTEM FILES

**Core DI Files**:
- `/packages/core/src/di/injector.ts` - Abstract Injector class (140 lines)
- `/packages/core/src/di/r3_injector.ts` - Runtime injector implementation (25,445 lines)
- `/packages/core/src/di/injectable.ts` - Injectable decorator (111 lines)
- `/packages/core/src/di/injection_token.ts` - InjectionToken class (112 lines)
- `/packages/core/src/di/provider_collection.ts` - Provider type definitions (14,612 lines)
- `/packages/core/src/di/forward_ref.ts` - Forward reference resolution (2,728 lines)

**DI Interfaces**:
- `/packages/core/src/di/interface/` - DI type definitions
  - `defs.ts` - Injectable definitions
  - `injector.ts` - Injector interface
  - `provider.ts` - Provider types

**Render3 DI Integration**:
- `/packages/core/src/render3/di.ts` - NodeInjector implementation (39,292 lines)

**Key Concepts**:
- **Provider Resolution**: Match token → create instance → inject dependencies
- **Circular Dependency Detection**: NOT_YET, CIRCULAR markers
- **Multi-Providers**: Array collection for same token

---

### 2. CHANGE DETECTION SYSTEM FILES

**Core Change Detection**:
- `/packages/core/src/change_detection/change_detector_ref.ts` - API for manual CD (163 lines)
- `/packages/core/src/change_detection/change_detection.ts` - Constants & strategies (1,764 lines)
- `/packages/core/src/change_detection/lifecycle_hooks.ts` - Lifecycle hook interfaces (7,448 lines)
- `/packages/core/src/change_detection/constants.ts` - Enum definitions (1,049 lines)

**Scheduling System**:
- `/packages/core/src/change_detection/scheduling/` - zoneless scheduling
  - `zoneless_scheduling.ts` - Modern scheduling without Zone.js

**Render3 Integration**:
- `/packages/core/src/render3/instructions/change_detection.ts` - CD instruction handling
- `/packages/core/src/render3/util/change_detection_utils.ts` - CD utilities

**Key Concepts**:
- **Two Strategies**: OnPush (CheckOnce) vs Default (CheckAlways)
- **View Flags**: Track dirty, checked, attached states
- **Hierarchical Propagation**: Parent → Child traversal

---

### 3. COMPONENT AND DIRECTIVE SYSTEM FILES

**Metadata Decorators**:
- `/packages/core/src/metadata/directives.ts` - @Directive/@Component (33,999 bytes)
- `/packages/core/src/metadata/di.ts` - @Input/@Output/@Host decorators (16,705 bytes)
- `/packages/core/src/metadata/ng_module.ts` - @NgModule decorator (6,881 bytes)

**Type System**:
- `/packages/core/src/metadata/schema.ts` - Schema validation (1,312 bytes)
- `/packages/core/src/metadata/view.ts` - ViewEncapsulation enum (1,997 bytes)
- `/packages/core/src/metadata/ng_module_def.ts` - Module definition (2,673 bytes)

**Render3 Component System**:
- `/packages/core/src/render3/component_ref.ts` - ComponentFactory/Ref (20,598 bytes)
- `/packages/core/src/render3/definition.ts` - Component definition structure (24,210 bytes)

**Key Concepts**:
- **Decorators**: @Component, @Directive, @Input, @Output, @ViewChild, @ContentChild
- **Metadata**: CSS selectors, providers, change detection strategy
- **Definition Objects**: Compiled metadata attached to class

---

### 4. RENDER3 ENGINE FILES

**Core Render3**:
- `/packages/core/src/render3/interfaces/definition.ts` - Definition interfaces (150+ lines)
- `/packages/core/src/render3/interfaces/view.ts` - LView/TView (620+ lines)
- `/packages/core/src/render3/interfaces/node.ts` - TNode types
- `/packages/core/src/render3/definition.ts` - Definition builder (24,210 bytes)

**View Management**:
- `/packages/core/src/render3/view/construction.ts` - View creation
- `/packages/core/src/render3/view_ref.ts` - ViewRef implementation
- `/packages/core/src/render3/view_manipulation.ts` - View insertion/removal

**Rendering Instructions**:
- `/packages/core/src/render3/instructions/element.ts` - Element instructions (ɵɵelementStart/End)
- `/packages/core/src/render3/instructions/shared.ts` - Shared instruction logic
- `/packages/core/src/render3/instructions/render.ts` - Template rendering
- `/packages/core/src/render3/instructions/mark_view_dirty.ts` - Change detection marking

**Template & Context**:
- `/packages/core/src/render3/context_discovery.ts` - Component discovery from DOM
- `/packages/core/src/render3/state.ts` - Execution state management

**Advanced Features**:
- `/packages/core/src/render3/di.ts` - Dependency injection at element level
- `/packages/core/src/render3/dom_node_manipulation.ts` - DOM operations

**Key Concepts**:
- **HEADER_OFFSET = 27**: Separates view header from element slots
- **LView[HOST]**: DOM element hosting view
- **LView[CONTEXT]**: Component/directive instance
- **RenderFlags**: Create (0b01) vs Update (0b10) phases

---

### 5. COMPILER SYSTEM FILES

**Main Compiler**:
- `/packages/compiler/src/compiler.ts` - Compiler entry point (108 lines)
- `/packages/compiler/src/compiler_facade_interface.ts` - Compiler interface (10,703 bytes)

**Render3 Compiler**:
- `/packages/compiler/src/render3/r3_identifiers.ts` - Instruction identifiers (21,620 bytes)
- `/packages/compiler/src/render3/r3_ast.ts` - Template AST (25,360 bytes)
- `/packages/compiler/src/render3/r3_template_transform.ts` - AST transformation (39,737 bytes)
- `/packages/compiler/src/render3/r3_factory.ts` - Factory function generation (11,210 bytes)

**Template Processing**:
- `/packages/compiler/src/template_parser/` - HTML/expression parsing
- `/packages/compiler/src/ml_parser/` - Markup language parsing
- `/packages/compiler/src/expression_parser/` - Expression ({{ }}) parsing

**Code Generation**:
- `/packages/compiler/src/output/output_ast.ts` - Code generation AST
- `/packages/compiler/src/constant_pool.ts` - Constant folding (12,546 bytes)

**JIT Compiler**:
- `/packages/compiler/src/jit_compiler_facade.ts` - JIT facade (35,092 bytes)

**Key Concepts**:
- **Two-Phase Compilation**: Parse → Generate Instructions
- **RenderFlags**: Create/Update optimization
- **Instruction Collapsing**: Merge compatible instructions
- **Constant Folding**: Static content extraction

---

### 6. ZONE.JS INTEGRATION FILES

**Core Zone Integration**:
- `/packages/core/src/zone/ng_zone.ts` - NgZone service (100+ lines)
- `/packages/core/src/zone/async-stack-tagging.ts` - Async debugging

**Scheduling**:
- `/packages/core/src/change_detection/scheduling/zoneless_scheduling.ts`
- `/packages/core/src/change_detection/scheduling/flags.ts`

**Key Concepts**:
- **Zone Patches**: Intercepts async APIs
- **Angular Zone**: Patched zone for CD triggering
- **Outside Zone**: Optimization escape hatch
- **Run/RunOutsideAngular**: Re-entry points

---

### 7. SIGNALS (REACTIVITY SYSTEM) FILES

**Signals Core**:
- `/packages/core/primitives/signals/src/signal.ts` - Writable signals (120+ lines)
- `/packages/core/primitives/signals/src/computed.ts` - Computed signals (100+ lines)
- `/packages/core/primitives/signals/src/graph.ts` - Reactive graph (150+ lines)
- `/packages/core/primitives/signals/src/effect.ts` - Effect system
- `/packages/core/primitives/signals/src/watch.ts` - Watch mechanism

**Utilities**:
- `/packages/core/primitives/signals/src/equality.ts` - Equality comparison
- `/packages/core/primitives/signals/src/errors.ts` - Error handling
- `/packages/core/primitives/signals/src/formatter.ts` - Debug formatting
- `/packages/core/primitives/signals/src/weak_ref.ts` - Weak reference handling

**Key Concepts**:
- **Reactive Graph**: Producer ↔ Consumer relationships
- **Version Tracking**: Increment on value change
- **Epoch System**: Global counter for staleness detection
- **Lazy Evaluation**: Computed only recalculate when dirty AND accessed
- **Dependency Tracking**: Automatic through setActiveConsumer

---

### 8. ROUTER SYSTEM FILES

**Core Router**:
- `/packages/router/src/router.ts` - Router service (25,866 bytes)
- `/packages/router/src/models.ts` - Route configuration (49,477 bytes)
- `/packages/router/src/router_state.ts` - Navigation state (17,192 bytes)

**Navigation Processing**:
- `/packages/router/src/navigation_transition.ts` - Navigation flow (38,425 bytes)
- `/packages/router/src/recognize.ts` - URL matching (20,019 bytes)
- `/packages/router/src/recognize_rxjs.ts` - RxJS-based matching (21,244 bytes)
- `/packages/router/src/create_url_tree.ts` - URL tree generation (21,135 bytes)

**Components & Directives**:
- `/packages/router/src/directives/router_outlet.ts` - RouterOutlet component
- `/packages/router/src/directives/router_link.ts` - RouterLink directive
- `/packages/router/src/components/empty_outlet.ts` - Outlet utilities

**Advanced Features**:
- `/packages/router/src/router_outlet_context.ts` - Outlet context (2,787 bytes)
- `/packages/router/src/route_reuse_strategy.ts` - Component reuse control (3,716 bytes)
- `/packages/router/src/router_scroller.ts` - Scroll position management (5,584 bytes)
- `/packages/router/src/router_preloader.ts` - Route preloading (5,889 bytes)

**Configuration & Events**:
- `/packages/router/src/events.ts` - Navigation events (21,429 bytes)
- `/packages/router/src/provide_router.ts` - Router setup (27,686 bytes)

**Key Concepts**:
- **Route Configuration Tree**: Hierarchical routes
- **URL Tree**: Segment-based URL representation
- **Guards**: Functional guards for auth/permissions
- **Resolvers**: Data fetching before activation
- **Navigation Flow**: Parse → Match → Guard → Resolve → Activate

---

## KEY ARCHITECTURAL PATTERNS WITH CODE

### Pattern 1: Two-Phase Rendering

```typescript
// Template Function Structure
function componentTemplate(rf: RenderFlags, ctx: Component) {
  if (rf & RenderFlags.Create) {
    // DOM creation (runs once)
    ɵɵelementStart(0, 'div');
    ɵɵtext(1, 'Static: ');
    ɵɵelementEnd();
  }
  
  if (rf & RenderFlags.Update) {
    // Binding updates (runs every check)
    ɵɵadvance(1);
    ɵɵtextInterpolate(ctx.message);
  }
}

// Usage:
componentTemplate(RenderFlags.Create | RenderFlags.Update, componentInstance);
// Or just update:
componentTemplate(RenderFlags.Update, componentInstance);
```

### Pattern 2: LView/TView Separation

```typescript
// TView: Static metadata (per component class)
interface TView {
  template: ComponentTemplate<any>;      // Render function
  data: TData;                           // Static node info
  consts: TConstantsOrFactory;           // Static content
  blueprint: LView;                      // Initial state
}

// LView: Instance data (per component instance)
interface LView extends Array<any> {
  [HOST]: RElement;                      // DOM host
  [CONTEXT]: T;                          // Component instance
  [TVIEW]: TView;                        // Reference to static data
  [FLAGS]: LViewFlags;                   // Dirty, checked, etc.
  [PARENT]: LView | null;                // Parent view
  // ... 27 header slots, then element slots
}
```

### Pattern 3: Reactive Graph (Signals)

```typescript
// Dependency tracking algorithm
export interface ReactiveNode {
  version: Version;              // Incremented on change
  producers: ReactiveLink[];     // Dependencies
  consumers: ReactiveLink[];     // Dependents
  dirty: boolean;               // Needs recalculation
  
  producerRecomputeValue(): void; // Compute new value
  consumerMarkedDirty(): void;   // Mark when dependency changes
}

// Usage:
const count = signal(0);                    // Creates producer node
const doubled = computed(() => count() * 2); // Creates consumer node
effect(() => console.log(doubled()));       // Creates effect consumer

// When count changes:
count.set(5);           // count.version++
// → Notify consumers
// → effect() marks as dirty
// → effect() recomputes
// → Accesses doubled
// → doubled detects it's dirty
// → Recomputes value
```

### Pattern 4: Hierarchical Dependency Injection

```typescript
// Three-level DI hierarchy
class EnvironmentInjector {
  // Platform level (root services)
  providers: Map<token, instance>;
}

class NodeInjector {
  // Component level (viewProviders, providers)
  parent: Injector;           // Parent NodeInjector or EnvironmentInjector
  providers: SingleProvider[];
  
  get<T>(token): T {
    // 1. Check self
    if (this.providers.has(token)) return create(token);
    // 2. Check parent
    return this.parent?.get(token);
  }
}

// Element level
class ElementDirective {
  constructor(injector: Injector) {
    // Injector is element-level
    // Falls back to component level
  }
}
```

### Pattern 5: Navigation Flow (Router)

```typescript
// 1. Parse URL
router.navigate(['/user', 123]);
// → createUrlTree(['/user', 123])
// → UrlTree { root: UrlSegmentGroup { segments: [User, 123] } }

// 2. Recognize routes
recognize(config, urlTree)
// → Match against config tree
// → Extract params: {userId: '123'}
// → Create ActivatedRouteSnapshot tree

// 3. Execute guards (parallel)
canActivate: [authGuard, permissionGuard]
// → Both must return true

// 4. Resolve data (parallel)
resolve: { user: userResolver }
// → Fetch data before activation

// 5. Create component
componentFactory.create(injector, projectableNodes)

// 6. Emit events
router.events.pipe(
  filter(e => e instanceof NavigationEnd)
)
```

### Pattern 6: Provider Resolution (DI)

```typescript
// Provider Types
type Provider = 
  | ValueProvider {provide: token, useValue: value}
  | TypeProvider {provide: token}  // class as token and implementation
  | ClassProvider {provide: token, useClass: implementationClass}
  | FactoryProvider {provide: token, useFactory: () => instance}
  | ExistingProvider {provide: token, useExisting: otherToken};

// Resolution Process
const instance = injector.get(MyService);
// 1. Lookup MyService in providers
// 2. If factory, call factory(injector)
// 3. If class, instantiate with injector.get(DepType)
// 4. If existing, get(otherToken)
// 5. Cache result
// 6. Return instance

// Circular Dependency Detection
const markers = {
  NOT_YET: {},
  CIRCULAR: {}
};

// During resolution:
providers[token] = CIRCULAR;          // Mark as in-progress
const instance = callFactory();        // Try to instantiate
providers[token] = instance;           // Success
```

### Pattern 7: Change Detection Propagation

```typescript
// View flags indicate change detection state
enum LViewFlags {
  Created = 1,
  OnPush = 1 << 1,      // OnPush strategy
  Dirty = 1 << 2,
  Attached = 1 << 3,
  Checked = 1 << 4,
}

// Detection process
function detectChanges(lView: LView) {
  if (!isAttached(lView)) return;      // Skip detached views
  if (lView[FLAGS] & LViewFlags.OnPush) {
    if (!isDirty(lView)) return;       // Skip if not marked
  }
  
  // Run template update
  template(RenderFlags.Update, lView[CONTEXT]);
  
  // Recursively check children
  for (let child of lView[CHILD_HEAD]) {
    detectChanges(child);
  }
}

// Marking for check (used in OnPush)
function markForCheck(lView: LView) {
  while (lView) {
    lView[FLAGS] |= LViewFlags.Dirty;
    lView = lView[PARENT];  // Propagate up
  }
}
```

### Pattern 8: Computed Signal Lazy Evaluation

```typescript
export function createComputed<T>(
  computation: () => T,
  equal?: ValueEqualityFn<T>
): ComputedGetter<T> {
  const node: ComputedNode<T> = {
    value: UNSET,
    dirty: true,
    version: 0,
    computation,
    lastCleanEpoch: 0
  };
  
  const computed = () => {
    // Only recompute if dirty
    if (node.dirty || node.lastCleanEpoch !== epoch) {
      producerBeforeComputation(node);
      
      try {
        const oldValue = node.value;
        const newValue = node.computation();
        
        if (!equal(oldValue, newValue)) {
          node.value = newValue;
          node.version++;
          node.dirty = false;
          producerNotifyConsumers(node);
        }
      } catch (error) {
        node.value = ERRORED;
        node.error = error;
      }
      
      producerAfterComputation(node);
    }
    
    if (node.value === ERRORED) throw node.error;
    return node.value;
  };
  
  return computed;
}
```

---

## INTEGRATION EXAMPLE: COMPONENT INSTANTIATION

```typescript
// 1. Compiler generates definition
class MyComponent {
  @Input() name: string;
  @Output() nameChange = new EventEmitter<string>();
  
  static ɵcmp = ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['app-my']],
    template: myComponentTemplate,
    inputs: {name: 'name'},
    outputs: {nameChange: 'nameChange'}
  });
}

// 2. Template function with instructions
function myComponentTemplate(rf: RenderFlags, ctx: MyComponent) {
  if (rf & RenderFlags.Create) {
    ɵɵelementStart(0, 'div');
    ɵɵlistener('click', () => ctx.onClicked());
    ɵɵelementEnd();
  }
  if (rf & RenderFlags.Update) {
    ɵɵadvance(0);
    ɵɵproperty('title', ctx.name);
  }
}

// 3. Runtime: Create component
const componentFactory = resolver.resolveComponentFactory(MyComponent);
const componentRef = componentFactory.create(injector);

// 4. Internally (simplified):
// a. Create LView
const lView = createLView(...)
lView[CONTEXT] = new MyComponent();
lView[INJECTOR] = createNodeInjector(...);

// b. Call template with Create flag
myComponentTemplate(RenderFlags.Create, lView[CONTEXT]);
// → Creates DOM <div>
// → Registers event listener

// c. Input binding
if (componentRef.instance.name !== newValue) {
  componentRef.instance.name = newValue;
  componentRef.changeDetectorRef.markForCheck();
}

// d. Change detection
componentRef.changeDetectorRef.detectChanges();
// → Calls template with Update flag
// → Updates DOM properties
```

---

## KEY TAKEAWAYS FOR EBOOK

### Mental Models
1. **Template as Function**: Templates compile to functions that manipulate DOM
2. **View as Array**: LView is array with header + element slots
3. **Reactive Graph**: Signals form DAG of producers/consumers
4. **Instructions as VM**: Compiled to sequence of function calls
5. **Zone as Scheduler**: Patches async APIs to trigger change detection

### Performance Tips
1. Use OnPush to reduce change detection
2. Use detach()/reattach() for large lists
3. Use runOutsideAngular() for heavy computations
4. Use signals instead of observables for UI state
5. Use lazy loading for route-based code splitting

### Debugging
1. Check LView structure: `ng.probe(element).componentInstance`
2. Mark views dirty: `changeDetectorRef.markForCheck()`
3. Manual CD: `changeDetectorRef.detectChanges()`
4. Zone issues: `ngZone.onStable.subscribe()`
5. Signal tracking: Enable with `@angular/core/debug`

