@cheatsheetSection
Bootstrapping
@cheatsheetIndex 0
@description
{@target js ts}`import {bootstrap} from 'angular2/angular2';`{@endtarget}
{@target dart}`import 'package:angular2/bootstrap.dart';`{@endtarget}

@cheatsheetItem
syntax:
`bootstrap​(MyAppComponent, [MyService, provide(...)]);`|`provide`
description:
Bootstraps an application with MyAppComponent as the root component, and
configures the app's dependency injection providers.
