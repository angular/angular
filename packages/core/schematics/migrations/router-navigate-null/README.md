## Router `navigate` and `navigateByUrl` null type migration

As of Angular v18, the `Router.navigate` and `Router.navigateByUrl` functions may return `null`
when navigation is skipped. This migration automatically identifies previous usages and adds
a type cast from `Promise<boolean|null>` to `Promise<boolean>` in places where type error would
occur in Angular v18.

#### Before

```ts
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
@Component()
export class MyComponent {
  private _router = inject(Router);
  navigateToHome(): Promise<boolean> {
    return this._router.navigateByUrl('/home'); // <- Compilation error in v18.
  }
  navigateToAboutUs(): Promise<boolean> {
    return this._router.navigate(['/about-us']); // <- Compilation error in v18.
  }
}
```

#### After

```ts
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
@Component()
export class MyComponent {
  private _router = inject(Router);
  navigateToHome(): Promise<boolean> {
    return this._router.navigateByUrl('/home').then((result) => result!); // <- type cast added during the migration.
  }
  navigateToAboutUs(): Promise<boolean> {
    return this._router.navigate(['/about-us']).then((result) => result!); // <- type cast added during the migration.
  }
}
```
