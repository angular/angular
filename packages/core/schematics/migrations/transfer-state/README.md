## Import TransferState-related symbols from `@angular/core`

The following symbols were moved from `@angular/platform-browser` to `@angular/core`:

* `TransferState`
* `makeStateKey`
* `StateKey`

This migration updates symbol imports to use `@angular/core`.

#### Before
```ts
import { TransferState, makeStateKey, StateKey } from '@angular/platform-browser';
```

#### After
```ts
import { TransferState, makeStateKey, StateKey } from '@angular/core';
```