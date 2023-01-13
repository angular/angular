## Guard and resolver interfaces migration

Since Angular v15.2, the `Router` guard and resolver interfaces have been deprecated.
Injectable classes can still be injected at the `Route` definition, but the `Router`
will not export interfaces that define a specific shape for those classes. Instead,
the guards and resolvers on the Route can inject the class and call whatever method
they want, regardless of the guard name.

#### Before
```ts
import { Injectable } from '@angular/router';
import { CanActivate } from '@angular/router';

@Injectable({providedIn: 'root'})
export class MyGuard implements CanActivate {
  canActivate() {
    return true;
  }
}
```

#### After
```ts
import { Injectable } from '@angular/router';

@Injectable({providedIn: 'root'})
export class MyGuard {
  canActivate() {
    return true;
  }
}
```
