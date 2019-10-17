## ModuleWithProviders migration

Automatically migrates `ModuleWithProviders` to include explicit generic typing. The 
`ModuleWithProviders` type will not default to the `any` type for its generic as of v9.

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
