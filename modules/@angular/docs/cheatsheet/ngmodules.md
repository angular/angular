@cheatsheetSection
NgModules
@cheatsheetIndex 1
@description
{@target ts}`import { NgModule } from '@angular/core';`{@endtarget}
{@target js}Available from the `ng.core` namespace{@endtarget}

@cheatsheetItem
syntax(ts):
`@NgModule({ declarations: ..., imports: ...,
     exports: ..., providers: ..., bootstrap: ...})
class MyModule {}`|`NgModule`
description:
Defines a module that contains components, directives, pipes, and providers.

syntax(js):
`ng.core.NgModule({declarations: ..., imports: ...,
     exports: ..., providers: ..., bootstrap: ...}).
Class({ constructor: function() {}})`
description:
Defines a module that contains components, directives, pipes, and providers.

@cheatsheetItem
syntax:
`declarations: [MyRedComponent, MyBlueComponent, MyDatePipe]`|`declarations:`
description:
List of components, directives, and pipes that belong to this module.

@cheatsheetItem
syntax(ts):
`imports: [BrowserModule, SomeOtherModule]`|`imports:`
description:
List of modules to import into this module. Everything from the imported modules
is available to `declarations` of this module.

syntax(js):
`imports: [ng.platformBrowser.BrowserModule, SomeOtherModule]`|`imports:`
description:
List of modules to import into this module. Everything from the imported modules
is available to `declarations` of this module.

@cheatsheetItem
syntax:
`exports: [MyRedComponent, MyDatePipe]`|`exports:`
description:
List of components, directives, and pipes visible to modules that import this module.

@cheatsheetItem
syntax:
`providers: [MyService, { provide: ... }]`|`providers:`
description:
List of dependency injection providers visible both to the contents of this module and to importers of this module.

@cheatsheetItem
syntax:
`bootstrap: [MyAppComponent]`|`bootstrap:`
description:
List of components to bootstrap when this module is bootstrapped.
