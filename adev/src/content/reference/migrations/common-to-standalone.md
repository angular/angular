# Convert CommonModule usage to standalone imports

This migration helps projects remove imports of the `CommonModule` inside components by adding the minimal set of directive and pipe imports each template requires (for example, `NgIf`, `NgFor`, `AsyncPipe`, etc.).

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:common-to-standalone

</docs-code>

## Options

| Option | Details                                                                                                                       |
| :----- | :---------------------------------------------------------------------------------------------------------------------------- |
| `path` | The path (relative to project root) to migrate. Defaults to `./`. Use this to incrementally migrate a subset of your project. |

## Example

Before:

```angular-ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show">
      {{ data | async | json }}
    </div>
  `
})
export class ExampleComponent {
  show = true;
  data = Promise.resolve({ message: 'Hello' });
}
```

After running the migration (component imports added, CommonModule removed):

```angular-ts
import { Component } from '@angular/core';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, NgIf],
  template: `
    <div *ngIf="show">
      {{ data | async | json }}
    </div>
  `
})
export class ExampleComponent {
  show = true;
  data = Promise.resolve({ message: 'Hello' });
}
```
