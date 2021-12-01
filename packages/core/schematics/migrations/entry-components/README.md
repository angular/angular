## entryComponents migration
As of Angular version 13, the `entryComponents` option in `@NgModule` and `@Component` isn't
necessary anymore. This migration will automatically remove any usages.

#### Before
```ts
import { NgModule, Component } from '@angular/core';

@Component({selector: 'my-comp', template: ''})
export class MyComp {}

@NgModule({
  declarations: [MyComp],
  entryComponents: [MyComp],
  exports: [MyComp]
})
export class MyModule {}
```

#### After
```ts
import { NgModule, Component } from '@angular/core';

@Component({selector: 'my-comp', template: ''})
export class MyComp {}

@NgModule({
  declarations: [MyComp],
  exports: [MyComp]
})
export class MyModule {}
```

