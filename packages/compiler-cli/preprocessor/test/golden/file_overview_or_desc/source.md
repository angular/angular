# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts", "test2.ts", "test3.ts", "test4.ts", "test5.ts", "test6.ts"]
}
```

# /test.ts

```ts
/** @desc abc123 */
const MY_MSG = goog.getMsg('abc123');

import {Injectable} from '@angular/core';
@Injectable()
export class MyService {}
```

# /test2.ts

```ts
/** @fileoverview */
/** @desc abc123 */
const MY_MSG = goog.getMsg('abc123');

import {Injectable} from '@angular/core';
@Injectable()
export class MyService {}
```

# /test3.ts

```ts
/** @modName {my_module} */

/** @desc abc123 */
const MY_MSG = goog.getMsg('abc123');

import {Injectable} from '@angular/core';
@Injectable()
export class MyService {}
```

# /test4.ts

```ts
/**
 * Helper function description.
 */
export function helper() {}

import {Injectable} from '@angular/core';
@Injectable()
export class MyService {}
```

# /test5.ts

```ts
/**
 * comment but no tag
 */

import {Injectable} from '@angular/core';
@Injectable()
export class MyService {}
```

# /test6.ts

```ts
/**
 * @fileoverview no blank line
 */
const a = 1;

import {Injectable} from '@angular/core';
@Injectable()
export class MyService {}
```