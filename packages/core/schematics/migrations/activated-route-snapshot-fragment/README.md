## `ActivatedRouteSnapshot.fragment` migration

The value if `ActivatedRouteSnapshot.fragment` is becoming nullable. This migration adds non-null
assertions to it.

#### Before
```ts
import { Component } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

@Component({})
export class YourComponent {
  private _activatedRouteSnapshot: ActivatedRouteSnapshot;

  getFragmentValue() {
    return this._activatedRouteSnapshot.fragment.value;
  }
}
```

#### After
```ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({})
export class YourComponent {
  private _activatedRouteSnapshot: ActivatedRouteSnapshot;

  getFragmentValue() {
    return this._activatedRouteSnapshot.fragment!.value;
  }
}
```
