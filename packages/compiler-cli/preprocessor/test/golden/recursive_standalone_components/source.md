# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["tree.component.ts"]
}
```

# /tree.component.ts
```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [TreeComponent],
  template: `
    @if (child) {
      <app-tree [child]="child.child"></app-tree>
    }
  `
})
export class TreeComponent {
  @Input() child: any;
}
```
