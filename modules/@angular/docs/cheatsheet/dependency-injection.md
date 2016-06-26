@cheatsheetSection
Dependency injection configuration
@cheatsheetIndex 9
@description
{@target dart}`import 'package:angular2/core.dart';`{@endtarget}

@cheatsheetItem
syntax(ts dart):
`{ provide: MyService, useClass: MyMockService }`|`provide`|`useClass`
syntax(js):
`{ provide: MyService, useClass: MyMockService }`|`provide`|`useClass`
description:
Sets or overrides the provider for MyService to the MyMockService class.


@cheatsheetItem
syntax(ts dart):
`{ provide: MyService, useFactory: myFactory }`|`provide`|`useFactory`
syntax(js):
`{ provide: MyService, useFactory: myFactory }`|`provide`|`useFactory`
description:
Sets or overrides the provider for MyService to the myFactory factory function.


@cheatsheetItem
syntax(ts dart):
`{ provide: MyValue, useValue: 41 }`|`provide`|`useValue`
syntax(js):
`{ provide: MyValue, useValue: 41 }`|`provide`|`useValue`
description:
Sets or overrides the provider for MyValue to the value 41.
