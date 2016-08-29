@cheatsheetSection
NgModules
@cheatsheetIndex 1
@description
{@target ts}`import { NgModule } from '@angular/core';`{@endtarget}
{@target js}Available from the `ng.core` namespace{@endtarget}

@cheatsheetItem
syntax(ts):
`@NgModule({ declarations: ..., imports: ..., exports: ..., bootstrap: ...})
class MyModule {}`|`NgModule`
description:
Defines a module that contains components, directives, pipes and providers.

syntax(js):
`ng.core.NgModule({declarations: ..., imports: ..., exports: ..., bootstrap: ...}).
class({ constructor: function() {}})`
description:
Defines a module that contains components, directives, pipes and providers.

@cheatsheetItem
syntax(ts js):
`declarations: [MyRedComponent, MyBlueComponent, MyDatePipe]`|`declarations:`
description:
List of components, directives and pipes that belong to this module.

@cheatsheetItem
syntax(ts):
`imports: [BrowserModule, SomeOtherModule]`|`imports:`
description:
List of modules that are being imported into this module. Everything from the imported modules will
be available to `declarations` of this module.

syntax(js):
`imports: [ng.platformBrowser.BrowserModule, SomeOtherModule]`|`imports:`
description:
List of modules that are being imported into this module. Everything from the imported modules will
be available to `declarations` of this module.

@cheatsheetItem
syntax(ts js):
`exports: [MyRedComponent, MyDatePipe]`|`exports:`
description:
List of components, directives and pipes that will be visible to modules that import this module.

@cheatsheetItem
syntax(ts js):
`providers: [MyService, { provide: ... }]`|`providers:`
description:
Array of dependency injection providers visible to contents of this module as well as everyone
importing this module.

@cheatsheetItem
syntax(ts js):
`bootstrap: [MyAppComponent]`|`bootstrap:`
description:
Array of components to bootstrap when this module is bootstrapped.
