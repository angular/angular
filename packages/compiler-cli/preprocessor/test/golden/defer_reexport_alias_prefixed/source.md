# /tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "experimentalDecorators": true,
    "baseUrl": ".",
    "paths": {
      "google3/*": ["*"]
    },
    "rootDirs": ["."]
  },
  "angularCompilerOptions": {
    "workspaceName": "google3"
  },
  "files": ["my/common/ng_for_of.ts", "my/common/index.ts", "list.ts"]
}
```

# /my/common/ng_for_of.ts

```ts
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[ngFor][ngForOf]'
})
export class NgForOf {
  @Input() ngForOf: string[] = [];
}
```

# /my/common/index.ts

```ts
export { NgForOf as NgFor } from './ng_for_of';
```

# /list.ts

```ts
import { NgFor } from 'google3/my/common/index';
import { Component } from '@angular/core';

@Component({
  imports: [NgFor],
  template: `
    @defer (on interaction) {
      <div *ngFor="let item of items">{{ item }}</div>
    } @placeholder {
      <span>Placeholder</span>
    }
  `,
})
export class ListComponent {
  items: string[] = [];
}
```
