## Router.navigateByUrl and Router.createUrlTree extras migration

Previously the `extras` parameter of `Router.navigateByUrl` and `Router.createUrlTree` accepted the
full `NavigationExtras` object, even though only a subset of properties was supported. This
migration removes the unsupported properties from the relevant method call sites.

#### Before
```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({})
export class MyComponent {
  constructor(private _router: Router) {}

  goHome() {
    this._router.navigateByUrl('/', {skipLocationChange: false, fragment: 'foo'});
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
    this._router.navigateByUrl('/', { /* Removed unsupported properties by Angular migration: fragment. */ skipLocationChange: false });
  }
}
```
