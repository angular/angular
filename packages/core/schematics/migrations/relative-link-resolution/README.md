## relativeLinkResolution migration

The default value for `relativeLinkResolution` is changing from 'legacy' to 'corrected'.
This migration updates `RouterModule` configurations that use the default value to 
now specifically use 'legacy' to prevent breakages when updating.

#### Before
```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES),
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
    RouterModule.forRoot(ROUTES, {relativeLinkResolution: 'legacy'}),
  ]
})
export class AppModule {
}
```