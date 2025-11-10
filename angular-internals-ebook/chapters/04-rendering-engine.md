# Chapter 4: The Rendering Engine Revealed

> *"How does Angular create and update the DOM?"*

## The LView Structure

Angular's Ivy rendering engine uses an array-based view structure:

```typescript
// Simplified LView structure
[
  // HEADER (27 slots)
  HOST,                    // 0
  TVIEW,                   // 1
  FLAGS,                   // 2
  PARENT,                  // 3
  NEXT,                    // 4
  TRANSPLANTED_VIEWS_TO_REFRESH, // 5
  T_HOST,                  // 6
  CLEANUP,                 // 7
  CONTEXT,                 // 8
  INJECTOR,                // 9
  ENVIRONMENT,             // 10
  RENDERER,                // 11
  // ... more header slots ...
  HEADER_OFFSET,           // 27

  // CONTENT (dynamic)
  <first element>,         // 27
  <text node>,             // 28
  <component instance>,    // 29
  // ...
]
```

## The Instruction-Based VM

Templates compile to instruction calls:

```html
<!-- Template -->
<div class="card">
  <h2>{{ title }}</h2>
  <p>{{ description }}</p>
</div>
```

```typescript
// Compiled output
function Template_MyComponent(rf: RenderFlags, ctx: MyComponent) {
  if (rf & RenderFlags.Create) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'h2');
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementStart(3, 'p');
    ɵɵtext(4);
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & RenderFlags.Update) {
    ɵɵadvance(2);
    ɵɵtextInterpolate(ctx.title);
    ɵɵadvance(2);
    ɵɵtextInterpolate(ctx.description);
  }
}
```

## Key Insights

1. **Two-Phase Rendering**: Create phase (once) + Update phase (on changes)
2. **Index-Based**: Everything accessed by numeric index
3. **VM-like**: Sequence of instruction calls
4. **Optimizable**: Compiler can merge/collapse instructions

**[Continue to Chapter 5: The Compiler's Magic →](05-compiler.md)**
