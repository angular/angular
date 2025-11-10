# Chapter 5: The Compiler's Magic

> *"What happens to my templates?"*

## The Compilation Pipeline

```
Template String → Parse → Transform → Generate → JavaScript
```

### Input (Template)
```html
<div *ngIf="isVisible" class="container">
  <app-child [data]="items" (click)="handleClick()"></app-child>
</div>
```

### Output (Generated Code)
```typescript
function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, MyComponent_div_0_Template, 2, 0, "div", 0);
  }
  if (rf & 2) {
    ɵɵproperty("ngIf", ctx.isVisible);
  }
}

function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 1);
    ɵɵelementStart(1, "app-child", 2);
    ɵɵlistener("click", function() { return ctx.handleClick(); });
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵadvance(1);
    ɵɵproperty("data", ctx.items);
  }
}
```

## AOT vs JIT

- **AOT** (Ahead-of-Time): Compiles during build → Smaller bundles, faster startup
- **JIT** (Just-in-Time): Compiles in browser → Slower, includes compiler in bundle

**Always use AOT in production!**

**[Continue to Chapter 6: Zone.js Deep Dive →](06-zone-js.md)**
