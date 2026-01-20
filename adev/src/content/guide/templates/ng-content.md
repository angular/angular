# Render templates from a parent component with `ng-content`

`<ng-content>` is a special element that accepts markup or a template fragment and controls how components render content. It does not render a real DOM element.

Here is an example of a `BaseButton` component that accepts any markup from its parent.

```angular-ts
// ./base-button/base-button.ts
import {Component} from '@angular/core';

@Component({
  selector: 'button[baseButton]',
  template: ` <ng-content /> `,
})
export class BaseButton {}
```

```angular-ts
// ./app.ts
import {Component} from '@angular/core';
import {BaseButton} from './base-button';

@Component({
  selector: 'app-root',
  imports: [BaseButton],
  template: ` <button baseButton>Next <span class="icon arrow-right"></span></button> `,
})
export class App {}
```

For more detail, check out the [`<ng-content>` in-depth guide](/guide/components/content-projection) for other ways you can leverage this pattern.
