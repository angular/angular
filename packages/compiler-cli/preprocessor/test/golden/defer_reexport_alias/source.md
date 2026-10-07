# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["ng_for_of.ts", "common.ts", "network_activity.ts"]
}
```

# /ng_for_of.ts

```ts
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[ngFor][ngForOf]',
  standalone: true,
})
export class NgForOf {
  @Input() ngForOf: string[] = [];
}
```

# /common.ts

```ts
export { NgForOf as NgFor } from './ng_for_of';
```

# /network_activity.ts

```ts
import { NgFor } from './common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-network-activity',
  standalone: true,
  imports: [NgFor],
  template: `
    @defer (on interaction) {
      <div *ngFor="let item of items">{{ item }}</div>
    } @placeholder {
      <span>Placeholder</span>
    }
  `,
})
export class NetworkActivityComponent {
  items: string[] = [];
}
```
