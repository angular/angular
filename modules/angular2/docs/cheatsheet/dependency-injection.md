@cheatsheetSection
Dependency injection configuration
@cheatsheetIndex 9
@description
{@target ts}`import {provide} from 'angular2/core';`{@endtarget}
{@target js}Available from the `ng.core` namespace{@endtarget}
{@target dart}`import 'package:angular2/core.dart';`{@endtarget}

@cheatsheetItem
syntax:
`provide(MyService, {useClass: MyMockService})`|`provide`|`useClass`
description:
Sets or overrides the provider for MyService to the MyMockService class.


@cheatsheetItem
syntax:
`provide(MyService, {useFactory: myFactory})`|`provide`|`useFactory`
description:
Sets or overrides the provider for MyService to the myFactory factory function.


@cheatsheetItem
syntax:
`provide(MyValue, {useValue: 41})`|`provide`|`useValue`
description:
Sets or overrides the provider for MyValue to the value 41.
