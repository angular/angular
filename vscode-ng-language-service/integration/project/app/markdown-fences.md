```angular-ts
import {Component} from '@angular/core';

@Component({
  template: `
    @if (isReadyTsFence) {
      <button (click)="onClick()">{{ label }}</button>
    }
  `,
  styles: `
    button {
      border-radius: 9999px;
      color: #4b5563;
    }
  `,
})
export class DemoComponent {}
```

```angular-html
<fieldset>
  @if (isReadyHtmlFence) {
    <span>{{ label }}</span>
  }
</fieldset>
```

```ts
@Component({
  template: `
    @if (shouldNotHighlight) {
      <div>{{ stillPlainTsFence }}</div>
    }
  `,
  styles: `
    button {
      border-radius: 2px;
    }
  `,
})
class PlainTsFenceComponent {}
```

Outside fenced block: @if should not get Angular block scopes.

```angular-html
<section>
  @if (isReadyBacktickFence) {
    <em>{{ label }}</em>
  }
</section>
```

```angularts
@if (malformedLanguageId) {
  <span>no match expected</span>
}
```

```Angular-TS
@if (caseVariantLanguageId) {
  <span>no match expected</span>
}
```

```angular-ts
@Component({
  template: `
    @if (backtickTsFence) {
      <span>{{ label }}</span>
    }
  `,
})
class BacktickTsFenceComponent {}
```

```angular-html
<input [value]="userName" (input)="onInput($event)" [(ngModel)]="model" />
<div *ngIf="visible"></div>
<div [attr.aria-label]="ariaLabel" [class.active]="isActive" [style.color]="textColor"></div>
```

```angular-html
@let computed = total | currency;
<div>{{ computed }}</div>
```

```angular-html
<p>{{ user.profile.name ?? 'anon' }}</p>
<p>{{ isReady ? valueA : valueB }}</p>
<p>{{ maybeNull ?? null }}</p>
<p>{{ isReady && true }}</p>
<p>{{ 0xFF + 42 + 3.14 }}</p>
```

```angular-html
@for (item of items; track item.id) {
  <span>{{ item.name }}</span>
} @empty {
  <span>Empty</span>
}

@switch (state) {
  @case ('ready') {
    <b>Ready</b>
  }
  @default {
    <b>Other</b>
  }
}
```

```angular-ts
@Component({
  host: {
    '[attr.aria-label]': 'hostAriaLabel',
    '(click)': 'onHostClick()',
  },
})
class HostCmp {}
```
