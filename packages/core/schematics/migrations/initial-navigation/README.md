## initialNavigation migration

Automatically migrates the `initialNavigation` property of the `RouterModule` to the newly
available options: `enabledNonBlocking` (default), `enabledBlocking`, and `disabled`.

#### Before
```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, {initialNavigation: 'legacy_disabled'}),
  ]
})
export class AppModule {
}
```

#### After
```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, {initialNavigation: 'disabled'}),
  ]
})
export class AppModule {
}
```

### Disclaimer

The migration only covers the most common patterns where developers set the `ExtraOptions#InitialNavigation` 
option to an outdated value. Therefore, if a user declares the option using a number of other methods, 
e.g. shorthand notation, variable declaration, or some other crafty method, they will have to migrate 
those options by hand. Otherwise, the compiler will error if the types are sufficiently enforced.

The basic migration strategy is as follows:
* `legacy_disabled` || `false` => `disabled`
* `legacy_enabled` || `true` => `enabledNonBlocking` (new default)