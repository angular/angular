# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["other.ts", "tree.component.ts"]
}
```

# /other.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'other-tree',
  template: '<span>other</span>',
})
export class SameNameComp {}
```

# /tree.component.ts
```ts
import { Component, Directive, forwardRef, Input } from '@angular/core';
import { SameNameComp as OtherSameNameComp } from './other';

@Directive({
  selector: '[dirA]',
})
export class DirA {}

@Component({
  selector: 'app-tree',
  imports: [DirA, TreeComponent],
  template: `
    @if (child) {
      <app-tree dirA [child]="child.child"></app-tree>
    }
  `
})
export class TreeComponent {
  @Input() child: any;
}

@Component({
  selector: 'app-forward-tree',
  imports: [DirA, forwardRef(() => ForwardTreeComponent)],
  template: `
    @if (child) {
      <app-forward-tree dirA [child]="child.child"></app-forward-tree>
    }
  `
})
export class ForwardTreeComponent {
  @Input() child: any;
}

@Component({
  selector: 'local-tree',
  imports: [OtherSameNameComp],
  template: '<other-tree></other-tree><local-tree></local-tree>',
})
export class SameNameComp {}
```
