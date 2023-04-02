## BrowserTransferStateModule migration

Since Angular version 14.1, `TransferState` class is available for injection without importing `BrowserTransferStateModule`. This module is now useless and can be removed.

#### Before
```ts
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule, 
    BrowserTransferStateModule
  ]
})
export class MyModule  {}
```

#### After
```ts
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule, 
  ]
})
export class MyModule  {}
```
