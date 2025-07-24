# Two-way binding

**Two way binding** is a shorthand to simultaneously bind a value into an element, while also giving that element the ability to propagate changes back through this binding.

## Syntax

The syntax for two-way binding is a combination of square brackets and parentheses, `[()]`. It combines the syntax from property binding, `[]`, and the syntax from event binding, `()`. The Angular community informally refers to this syntax as "banana-in-a-box".

## Two-way binding with form controls

Developers commonly use two-way binding to keep component data in sync with a form control as a user interacts with the control. For example, when a user fills out a text input, it should update the state in the component.

The following example dynamically updates the `firstName` attribute on the page:

```angular-ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <main>
      <h2>Hello {{ firstName }}!</h2>
      <input type="text" [(ngModel)]="firstName" />
    </main>
  `
})
export class AppComponent {
  firstName = 'Ada';
}
```

To use two-way binding with native form controls, you need to:

1. Import the `FormsModule` from `@angular/forms`
1. Use the `ngModel` directive with the two-way binding syntax (e.g., `[(ngModel)]`)
1. Assign it the state that you want it to update (e.g., `firstName`)

Once that is set up, Angular will ensure that any updates in the text input will reflect correctly inside of the component state!

Learn more about [`NgModel`](guide/directives#displaying-and-updating-properties-with-ngmodel) in the official docs.

## Two-way binding between components

Leveraging two-way binding between a parent and child component requires more configuration compared to form elements.

Here is an example where the `AppComponent` is responsible for setting the initial count state, but the logic for updating and rendering the UI for the counter primarily resides inside its child `CounterComponent`.

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { CounterComponent } from './counter/counter.component';

@Component({
  selector: 'app-root',
  imports: [CounterComponent],
  template: `
    <main>
      <h1>Counter: {{ initialCount }}</h1>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class AppComponent {
  initialCount = 18;
}
```

```angular-ts
// './counter/counter.component.ts';
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="updateCount(-1)">-</button>
    <span>{{ count() }}</span>
    <button (click)="updateCount(+1)">+</button>
  `,
})
export class CounterComponent {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update(currentCount => currentCount + amount);
  }
}
```

### Enabling two-way binding between components

If we break down the example above to its core, each two-way binding for components requires the following:

The child component must contain a `model` property.

Here is a simplified example:

```angular-ts
// './counter/counter.component.ts';
import { Component, model } from '@angular/core';

@Component({ /* Omitted for brevity */ })
export class CounterComponent {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update(currentCount => currentCount + amount);
  }
}
```

The parent component must:

1. Wrap the `model` property name in the two-way binding syntax.
1. Assign a property or a signal to the `model` property.

Here is a simplified example:

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { CounterComponent } from './counter/counter.component';

@Component({
  selector: 'app-root',
  imports: [CounterComponent],
  template: `
    <main>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class AppComponent {
  initialCount = 18;
}
```
