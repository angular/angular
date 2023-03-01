## Relative link resolution migration

As of Angular v15, the deprecated `relativeLinkResolution` config option of the Router is removed.
This migration cleans up (removes) the `relativeLinkResolution` fields from the Router config objects
in applications code.

#### Before
```ts
import { RouterModule } from '@angular/router';

RouterModule.forRoot([], {
  relativeLinkResolution: 'legacy',
  enableTracing: false,
});
```

#### After
```ts
import { RouterModule } from '@angular/router';

RouterModule.forRoot([], {
  // the `relativeLinkResolution` is removed
  enableTracing: false,
});
```
