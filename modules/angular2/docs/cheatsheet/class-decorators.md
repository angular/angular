@cheatsheetSection
Class decorators
@cheatsheetIndex 4
@description
{@target js ts}`import {Directive, ...} from 'angular2/angular2';`{@endtarget}
{@target dart}`import 'package:angular2/angular2.dart';`{@endtarget}

@cheatsheetItem
syntax(js ts):
`@Component({...})
class MyComponent() {}`|`@Component({...})`
syntax(dart):
`@Component(...)
class MyComponent() {}`|`@Component(...)`
description:
Declares that a class is a component and provides metadata about the component.

@cheatsheetItem
syntax(js ts):
`@Pipe({...})
class MyPipe() {}`|`@Pipe({...})`
syntax(dart):
`@Pipe(...)
class MyPipe() {}`|`@Pipe(...)`
description:
Declares that a class is a pipe and provides metadata about the pipe.

@cheatsheetItem
syntax(js ts):
`@Injectable()
class MyService() {}`|`@Injectable()`
syntax(dart):
`@Injectable()
class MyService() {}`|`@Injectable()`
description:
Declares that a class has dependencies that should be injected into the constructor when the dependency
injector is creating an instance of this class.
