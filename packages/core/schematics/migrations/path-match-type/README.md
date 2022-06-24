## Route.pathMatch type changing from `string` `'full'|'prefix'`

This migration updates the type of `Route` or `Routes` which use `patchMatch` to be
explicit so they conform the new strict type of the property. The explicit `Route`/`Routes`
type is necessary because otherwise TypeScript will consider the type of `pathMatch`
to be `string`.

#### Before
```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

const routes = [{path: '', pathMatch: 'full', redirectTo: 'home'}]

@NgModule({
  imports: [RouterModule.forRoot(routes)]
})
export const RoutingModule {}
```

#### After
```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{path: '', pathMatch: 'full', redirectTo: 'home'}]

@NgModule({
  imports: [RouterModule.forRoot(routes)]
})
export const RoutingModule {}
```