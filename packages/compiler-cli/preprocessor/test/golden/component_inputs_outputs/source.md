# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["greeting.component.ts", "app.component.ts"]
}
```

# /greeting.component.ts
```ts
import { Component, Input, Output, EventEmitter, input, output, model } from '@angular/core';

@Component({
  selector: 'app-greeting',
  template: '<div>Hello, {{name()}}! Count: {{count}}</div>',
  standalone: true,
})
export class GreetingComponent {
  // Decorator-based input
  @Input() count: number = 0;

  // Decorator-based input with alias
  @Input('userName') displayName: string = '';

  // Decorator-based required input
  @Input({ required: true }) title!: string;

  // Signal input
  name = input<string>('World');

  // Signal input with alias
  greeting = input<string>('Hi', { alias: 'greetingText' });

  // Required signal input
  id = input.required<number>();

  // Decorator-based output
  @Output() clicked = new EventEmitter<void>();

  // Decorator-based output with alias
  @Output('valueChanged') change = new EventEmitter<number>();

  // Signal output
  submitted = output<string>();

  // Signal output with alias
  cancelled = output<void>({ alias: 'onCancel' });

  // Model (two-way binding)
  value = model<string>('');

  // Model with alias
  checked = model<boolean>(false, { alias: 'isChecked' });

  // Required model
  selectedId = model.required<number>();
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { GreetingComponent } from './greeting.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GreetingComponent],
  template: `
    <app-greeting
      [count]="1"
      [userName]="'User'"
      [title]="'Hello'"
      [name]="'Signal'"
      [greetingText]="'Hi'"
      [id]="123"
      (clicked)="handleClick()"
      (valueChanged)="handleChange($event)"
      (submitted)="handleSubmit($event)"
      (onCancel)="handleCancel()"
      [(value)]="value"
      [(isChecked)]="isChecked"
      [(selectedId)]="selectedId"
    ></app-greeting>
  `,
})
export class AppComponent {
  value = '';
  isChecked = false;
  selectedId = 1;

  handleClick() {}
  handleChange(v: number) {}
  handleSubmit(v: string) {}
  handleCancel() {}
}
```
