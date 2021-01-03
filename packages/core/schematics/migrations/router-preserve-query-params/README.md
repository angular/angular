## Router's NavigationExtras.preserveQueryParams migration

Previously the `NatigationExtras` property of `preserveQueryParams` defined what should be done with
query parameters on navigation.  This migration updates the usages of `preserveQueryParams` to
instead use the `queryParamsHandling` property.

#### Before
```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({})
export class MyComponent {
  constructor(private _router: Router) {}

  goHome() {
    this._router.navigate('/', {preserveQueryParams: true, skipLocationChange: 'foo'});
  }
}
```

#### After
```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({})
export class MyComponent {
  constructor(private _router: Router) {}

  goHome() {
    this._router.navigate('/', { queryParamsHandling: 'preserve', skipLocationChange: 'foo' });
  }
}
```
