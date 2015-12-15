@cheatsheetSection
Bootstrapping
@cheatsheetIndex 0
@description
{@target ts}`import {bootstrap} from 'angular2/angular2';`{@endtarget}
{@target js}Available from the `ng.platform.browser` namespace.{@endtarget}
{@target dart}`import 'package:angular2/bootstrap.dart';`{@endtarget}

@cheatsheetItem
syntax(ts dart):
`bootstrap​(MyAppComponent, [MyService, provide(...)]);`|`provide`
syntax(js):
`ng.platform.browser.bootstrap(MyAppComponent,
  [MyService, ng.core.provide(...)]);`|`provide`
description:
Bootstraps an application with MyAppComponent as the root component and configures the DI providers.
