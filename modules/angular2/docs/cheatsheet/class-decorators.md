@cheatsheetSection
Class decorators
@cheatsheetIndex 4
@description
{@target ts}`import {Directive, ...} from 'angular2/core';`{@endtarget}
{@target js}Available from the `ng.core` namespace{@endtarget}
{@target dart}`import 'package:angular2/core.dart';`{@endtarget}

@cheatsheetItem
syntax(ts):
`@Component({...})
class MyComponent() {}`|`@Component({...})`
syntax(js):
`var MyComponent = ng.core.Component({...})`|`ng.core.Component({...})`
syntax(dart):
`@Component(...)
class MyComponent() {}`|`@Component(...)`
description:
Declares that {@target ts dart}a class{@endtarget}{@target js}an object{@endtarget} is a component and provides metadata about the component.

@cheatsheetItem
syntax(ts):
`@Pipe({...})
class MyPipe() {}`|`@Pipe({...})`
syntax(js):
`var MyPipe = ng.core.Pipe({...})`|`ng.core.Pipe({...})`
syntax(dart):
`@Pipe(...)
class MyPipe() {}`|`@Pipe(...)`
description:
Declares that {@target ts dart}a class{@endtarget}{@target js}an object{@endtarget} is a pipe and provides metadata about the pipe.

@cheatsheetItem
syntax(ts):
`@Injectable()
class MyService() {}`|`@Injectable()`
syntax(js):
`var MyService = ng.core.Injectable({...})`|`ng.core.Injectable({...})`
syntax(dart):
`@Injectable()
class MyService() {}`|`@Injectable()`
description:
Declares that {@target ts dart}a class{@endtarget}{@target js}an object{@endtarget} has dependencies that should be injected into the constructor when the dependency
injector is creating an instance of this {@target ts dart}class{@endtarget}{@target js}object{@endtarget}.
