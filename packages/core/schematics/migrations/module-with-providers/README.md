## ModuleWithProviders migration

`ModuleWithProviders` type will not default to the `any` type for its generic in a future version of Angular. 
This migration adds a generic to any `ModuleWithProvider` types found.

#### Before
```ts
import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({})
export class MyModule {
  static forRoot(): ModuleWithProviders {
    ngModule: MyModule
  }
}
```

#### After
```ts
import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({})
export class MyModule {
  static forRoot(): ModuleWithProviders<MyModule> {
    ngModule: MyModule
  }
}
```
