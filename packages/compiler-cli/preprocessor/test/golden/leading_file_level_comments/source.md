# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts", "test2.ts", "test3.ts", "test4.ts", "test5.ts", "other.ts"]
}
```

# /other.ts

```ts
export const OTHER = 1;
```

# /test.ts

```ts
// @ts-nocheck
export * from './other';

import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-reexport-first',
  template: '<div [ngClass]="{a: true, b: false}"></div>',
  imports: [CommonModule],
})
export class ReexportFirstComponent {}
```

# /test2.ts

```ts
// @ts-nocheck
import {Component} from '@angular/core';

@Component({selector: 'app-import-first', template: ''})
export class ImportFirstComponent {}
```

# /test3.ts

```ts
/**
 * @fileoverview This is a file that starts with an enum.
 */

// @ts-nocheck

export enum Mode {
  On,
  Off,
}

import {Component} from '@angular/core';

@Component({selector: 'app-enum-first', template: ''})
export class EnumFirstComponent {}
```

# /test4.ts

```ts
/// <reference types="node" />
// @ts-nocheck
export const VERSION = '1';

import {Component} from '@angular/core';

@Component({selector: 'app-reference-first', template: ''})
export class ReferenceFirstComponent {}
```

# /test5.ts

```ts
// @ts-nocheck
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-trailing-import',
  template: '<div [ngClass]="someValue"></div>',
  imports: [CommonModule],
})
export class TrailingImportComponent {
  someValue = '';
}

import {OTHER} from './other';
```
