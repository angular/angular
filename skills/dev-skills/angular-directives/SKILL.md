---
name: angular-directives
description: Create custom directives in Angular v20+ for DOM manipulation and behavior extension. Use for attribute directives that modify element behavior/appearance, structural directives for portals/overlays, and host directives for composition. Triggers on creating reusable DOM behaviors, extending element functionality, or composing behaviors across components. Note - use native @if/@for/@switch for control flow, not custom structural directives.
license: MIT
compatibility: Requires node, npm, and access to the internet
metadata:
  author: Brandon Roberts
  version: '1.0'
---

# Angular Directives

Create custom directives for reusable DOM manipulation and behavior in Angular v20+.

## Attribute Directives

Modify the appearance or behavior of an element:

```typescript
import {Directive, input, effect, inject, ElementRef} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class Highlight {
  private el = inject(ElementRef<HTMLElement>);

  // Input with alias matching selector
  color = input('yellow', {alias: 'appHighlight'});

  constructor() {
    effect(() => {
      this.el.nativeElement.style.backgroundColor = this.color();
    });
  }
}

// Usage: <p appHighlight="lightblue">Highlighted text</p>
// Usage: <p appHighlight>Default yellow highlight</p>
```

### Using host Property

Prefer `host` over `@HostBinding`/`@HostListener`:

```typescript
@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '[attr.aria-describedby]': 'tooltipId',
  },
})
export class Tooltip {
  text = input.required<string>({alias: 'appTooltip'});
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');

  tooltipId = `tooltip-${crypto.randomUUID()}`;
  private tooltipEl: HTMLElement | null = null;
  private el = inject(ElementRef<HTMLElement>);

  show() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.id = this.tooltipId;
    this.tooltipEl.className = `tooltip tooltip-${this.position()}`;
    this.tooltipEl.textContent = this.text();
    this.tooltipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(this.tooltipEl);
    this.positionTooltip();
  }

  hide() {
    this.tooltipEl?.remove();
    this.tooltipEl = null;
  }

  private positionTooltip() {
    // Position logic based on this.position() and this.el
  }
}

// Usage: <button appTooltip="Click to save" position="bottom">Save</button>
```

### Class and Style Manipulation

```typescript
@Directive({
  selector: '[appButton]',
  host: {
    'class': 'btn',
    '[class.btn-primary]': 'variant() === "primary"',
    '[class.btn-secondary]': 'variant() === "secondary"',
    '[class.btn-sm]': 'size() === "small"',
    '[class.btn-lg]': 'size() === "large"',
    '[class.disabled]': 'disabled()',
    '[attr.disabled]': 'disabled() || null',
  },
})
export class Button {
  variant = input<'primary' | 'secondary'>('primary');
  size = input<'small' | 'medium' | 'large'>('medium');
  disabled = input(false, {transform: booleanAttribute});
}

// Usage: <button appButton variant="primary" size="large">Click</button>
```

### Event Handling

```typescript
@Directive({
  selector: '[appClickOutside]',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class ClickOutside {
  private el = inject(ElementRef<HTMLElement>);

  clickOutside = output<void>();

  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.clickOutside.emit();
    }
  }
}

// Usage: <div appClickOutside (clickOutside)="closeMenu()">...</div>
```

### Keyboard Shortcuts

```typescript
@Directive({
  selector: '[appShortcut]',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class Shortcut {
  key = input.required<string>({alias: 'appShortcut'});
  ctrl = input(false, {transform: booleanAttribute});
  shift = input(false, {transform: booleanAttribute});
  alt = input(false, {transform: booleanAttribute});

  triggered = output<KeyboardEvent>();

  onKeydown(event: KeyboardEvent) {
    const keyMatch = event.key.toLowerCase() === this.key().toLowerCase();
    const ctrlMatch = this.ctrl()
      ? event.ctrlKey || event.metaKey
      : !event.ctrlKey && !event.metaKey;
    const shiftMatch = this.shift() ? event.shiftKey : !event.shiftKey;
    const altMatch = this.alt() ? event.altKey : !event.altKey;

    if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
      event.preventDefault();
      this.triggered.emit(event);
    }
  }
}

// Usage: <button appShortcut="s" ctrl (triggered)="save()">Save (Ctrl+S)</button>
```

## Structural Directives

Use structural directives for DOM manipulation beyond control flow (portals, overlays, dynamic insertion points). For conditionals and loops, use native `@if`, `@for`, `@switch`.

### Portal Directive

Render content in a different DOM location:

```typescript
import {
  Directive,
  inject,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  input,
} from '@angular/core';

@Directive({
  selector: '[appPortal]',
})
export class Portal implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainerRef = inject(ViewContainerRef);
  private viewRef: EmbeddedViewRef<any> | null = null;

  // Target container selector or element
  target = input<string | HTMLElement>('body', {alias: 'appPortal'});

  ngOnInit() {
    const container = this.getContainer();
    if (container) {
      this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.viewRef.rootNodes.forEach((node) => container.appendChild(node));
    }
  }

  ngOnDestroy() {
    this.viewRef?.destroy();
  }

  private getContainer(): HTMLElement | null {
    const target = this.target();
    if (typeof target === 'string') {
      return document.querySelector(target);
    }
    return target;
  }
}

// Usage: Render modal at body level
// <div *appPortal="'body'">
//   <div class="modal">Modal content</div>
// </div>
```

### Lazy Render Directive

Defer rendering until condition is met (one-time):

```typescript
@Directive({
  selector: '[appLazyRender]',
})
export class LazyRender {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private rendered = false;

  condition = input.required<boolean>({alias: 'appLazyRender'});

  constructor() {
    effect(() => {
      // Only render once when condition becomes true
      if (this.condition() && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      }
    });
  }
}

// Usage: Render heavy component only when tab is first activated
// <div *appLazyRender="activeTab() === 'reports'">
//   <app-heavy-reports />
// </div>
```

### Template Outlet with Context

```typescript
interface TemplateContext<T> {
  $implicit: T;
  item: T;
  index: number;
}

@Directive({
  selector: '[appTemplateOutlet]',
})
export class TemplateOutlet<T> {
  private viewContainer = inject(ViewContainerRef);
  private currentView: EmbeddedViewRef<TemplateContext<T>> | null = null;

  template = input.required<TemplateRef<TemplateContext<T>>>({alias: 'appTemplateOutlet'});
  context = input.required<T>({alias: 'appTemplateOutletContext'});
  index = input(0, {alias: 'appTemplateOutletIndex'});

  constructor() {
    effect(() => {
      const template = this.template();
      const context = this.context();
      const index = this.index();

      if (this.currentView) {
        this.currentView.context.$implicit = context;
        this.currentView.context.item = context;
        this.currentView.context.index = index;
        this.currentView.markForCheck();
      } else {
        this.currentView = this.viewContainer.createEmbeddedView(template, {
          $implicit: context,
          item: context,
          index,
        });
      }
    });
  }
}

// Usage: Custom list with template
// <ng-template #itemTemplate let-item let-i="index">
//   <div>{{ i }}: {{ item.name }}</div>
// </ng-template>
// <ng-container
//   *appTemplateOutlet="itemTemplate; context: item; index: i"
// />
```

## Host Directives

Compose directives on components or other directives:

```typescript
// Reusable behavior directives
@Directive({
  selector: '[focusable]',
  host: {
    'tabindex': '0',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '[class.focused]': 'isFocused()',
  },
})
export class Focusable {
  isFocused = signal(false);

  onFocus() {
    this.isFocused.set(true);
  }
  onBlur() {
    this.isFocused.set(false);
  }
}

@Directive({
  selector: '[disableable]',
  host: {
    '[class.disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
  },
})
export class Disableable {
  disabled = input(false, {transform: booleanAttribute});
}

// Component using host directives
@Component({
  selector: 'app-custom-button',
  hostDirectives: [
    Focusable,
    {
      directive: Disableable,
      inputs: ['disabled'],
    },
  ],
  host: {
    'role': 'button',
    '(click)': 'onClick($event)',
    '(keydown.enter)': 'onClick($event)',
    '(keydown.space)': 'onClick($event)',
  },
  template: `<ng-content />`,
})
export class CustomButton {
  private disableable = inject(Disableable);

  clicked = output<void>();

  onClick(event: Event) {
    if (!this.disableable.disabled()) {
      this.clicked.emit();
    }
  }
}

// Usage: <app-custom-button disabled>Click me</app-custom-button>
```

### Exposing Host Directive Outputs

```typescript
@Directive({
  selector: '[hoverable]',
  host: {
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '[class.hovered]': 'isHovered()',
  },
})
export class Hoverable {
  isHovered = signal(false);

  hoverChange = output<boolean>();

  onEnter() {
    this.isHovered.set(true);
    this.hoverChange.emit(true);
  }

  onLeave() {
    this.isHovered.set(false);
    this.hoverChange.emit(false);
  }
}

@Component({
  selector: 'app-card',
  hostDirectives: [
    {
      directive: Hoverable,
      outputs: ['hoverChange'],
    },
  ],
  template: `<ng-content />`,
})
export class Card {}

// Usage: <app-card (hoverChange)="onHover($event)">...</app-card>
```

## Directive Composition API

Combine multiple behaviors:

```typescript
// Base directives
@Directive({selector: '[withRipple]'})
export class Ripple {
  // Ripple effect implementation
}

@Directive({selector: '[withElevation]'})
export class Elevation {
  elevation = input(2);
}

// Composed component
@Component({
  selector: 'app-material-button',
  hostDirectives: [
    Ripple,
    {
      directive: Elevation,
      inputs: ['elevation'],
    },
    {
      directive: Disableable,
      inputs: ['disabled'],
    },
  ],
  template: `<ng-content />`,
})
export class MaterialButton {}
```

For advanced patterns, see [references/directive-patterns.md](references/directive-patterns.md).
