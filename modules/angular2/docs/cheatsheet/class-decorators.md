@cheatsheetSection
Class decorators
@cheatsheetIndex 4
@description
`import {Directive, ...} from 'angular2/angular2';`

@cheatsheetItem
syntax:
`@Component({...})
class MyComponent() {}`|`@Component({...})`
description:
Declares that a class is a component and provides metadata about the component.

@cheatsheetItem
syntax:
`@Pipe({...})
class MyPipe() {}`|`@Pipe({...})`
description:
Declares that a class is a pipe and provides metadata about the pipe.

@cheatsheetItem
syntax:
`@Injectable()
class MyService() {}`|`@Injectable()`
description:
Declares that a class has dependencies that should be injected into the constructor when the dependency
injector is creating an instance of this class.