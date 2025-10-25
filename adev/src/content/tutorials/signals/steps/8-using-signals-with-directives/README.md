# Using signals with directives

Now that you've learned [using signals with services](/tutorials/signals/7-using-signals-with-services), let's explore how directives use signals. **The great news: signals work exactly the same in directives as they do in components!** The main difference is that since directives don't have templates, you'll primarily use signals in host bindings to reactively update the host element.

In this activity, you'll build a highlight directive that demonstrates how signals create reactive behavior in directives.

<hr />

<docs-workflow>

<docs-step title="Set up signals just like in a component">
Import the signal functions and create your reactive state. This works exactly the same as in components:

```ts
import {Directive, input, signal, computed} from '@angular/core';

@Directive({
  selector: '[highlight]',
})
export class HighlightDirective {
  // Signal inputs - same as components!
  color = input<string>('yellow');
  intensity = input<number>(0.3);

  // Internal state - same as components!
  private isHovered = signal(false);

  // Computed signals - same as components!
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
}
```

Notice how this is identical to component patterns - the only difference is we're in a `@Directive` instead of `@Component`.
</docs-step>

<docs-step title="Use signals in host bindings">
Since directives don't have templates, you'll use signals in **host bindings** to reactively update the host element. Add the `host` configuration and event handlers:

```ts
@Directive({
  selector: '[highlight]',
  host: {
    '[style.backgroundColor]': 'backgroundStyle()',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightDirective {
  // ... signals from previous step ...

  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }
}
```

The host bindings automatically re-evaluate when the signals change - just like template bindings in components! When `isHovered` changes, the `backgroundStyle` computed signal recalculates, and the host binding updates the element's style.
</docs-step>

<docs-step title="Use the directive in your template">
Update the app template to demonstrate the reactive directive:

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

The directive automatically applies reactive highlighting based on the signal inputs!
</docs-step>

</docs-workflow>

Perfect! You've now seen how signals work with directives. Some key takeaways from this lesson are:

- **Signals are universal** - All signal APIs (`input()`, `signal()`, `computed()`, `effect()`) work the same in both directives and components
- **Host bindings are the primary use case** - Since directives don't have templates, you use signals in host bindings to reactively modify the host element
- **Same reactive patterns** - Signal updates trigger automatic re-evaluation of computed signals and host bindings, just like in component templates

In the next lesson, you'll [learn how to query child elements with signal queries](/tutorials/signals/9-query-child-elements-with-signal-queries)!
