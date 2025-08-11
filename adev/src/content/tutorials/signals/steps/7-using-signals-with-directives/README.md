# Using signals with directives

Now that you've learned [using signals with services](/tutorials/signals/6-using-signals-with-services), let's explore how directives can use signals to create reactive behavior that automatically responds to changes. This makes directives more powerful and easier to manage.

In this activity, you'll learn how to use signals in directives for reactive styling and user interactions.

<hr />

Let's build a simple highlight directive that demonstrates the core signals concepts in directives.

<docs-workflow>

<docs-step title="Import signal functions">
First, add the signal imports to the directive.

```ts
import {Directive, input, signal, computed} from '@angular/core';
```

Directives can use all the same signal APIs as components.
</docs-step>

<docs-step title="Create signal inputs">
Add signal inputs to configure the directive behavior.

```ts
// Signal inputs for configuration
color = input<string>('yellow');
intensity = input<number>(0.3);
```

Signal inputs allow parent elements to pass reactive data to the directive.
</docs-step>

<docs-step title="Add internal signal state">
Create an internal signal to track the hover state.

```ts
// Internal signal for hover state
private isHovered = signal(false);
```

This signal will track whether the user is hovering over the element.
</docs-step>

<docs-step title="Create computed signal for styling">
Add a computed signal that calculates the background style.

```ts
// Computed signal for background style
backgroundStyle = computed(() => {
  const baseColor = this.color();
  const alpha = this.isHovered() ? this.intensity() : this.intensity() * 0.5;

  const colorMap: Record<string, string> = {
    'yellow': `rgba(255, 255, 0, ${alpha})`,
    'blue': `rgba(0, 100, 255, ${alpha})`,
    'green': `rgba(0, 200, 0, ${alpha})`,
    'red': `rgba(255, 0, 0, ${alpha})`,
  };

  return colorMap[baseColor] || colorMap['yellow'];
});
```

This computed signal reactively calculates the background color based on inputs and hover state.
</docs-step>

<docs-step title="Configure the directive with host bindings">
Use the `host` object to bind the computed signal and handle events.

```ts
@Directive({
  selector: '[highlight]',
  host: {
    '[style.backgroundColor]': 'backgroundStyle()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
```

This approach is more declarative and follows Angular v20+ best practices.
</docs-step>

<docs-step title="Add event handler methods">
Add the methods that update the hover signal.

```ts
onMouseEnter() {
  this.isHovered.set(true);
}

onMouseLeave() {
  this.isHovered.set(false);
}
```

These methods update the signal, which automatically triggers the computed signal to recalculate.
</docs-step>

<docs-step title="Use the directive in your template">
Update the app template to demonstrate the directive.

```ts
template: `
  <div>
    <h1>Directive with Signals</h1>

    <div highlight color="yellow" [intensity]="0.2">
      Hover me - Yellow highlight
    </div>

    <div highlight color="blue" [intensity]="0.4">
      Hover me - Blue highlight
    </div>

    <div highlight color="green" [intensity]="0.6">
      Hover me - Green highlight
    </div>
  </div>
`,
```

The directive automatically applies reactive highlighting based on the signal inputs.
</docs-step>

</docs-workflow>

Excellent! You've learned how to use signals in directives. Key concepts to remember:

- **Signal inputs** - Reactive configuration from parent elements
- **Internal signals** - Managing directive state
- **Computed signals** - Reactive calculations based on multiple signals
- **Host object bindings** - A declarative approach to connect signals to DOM properties and events
- **Reactive event handling** - Updating signals in response to user interactions

Signals make directives more predictable and easier to debug by providing clear reactive data flow.
