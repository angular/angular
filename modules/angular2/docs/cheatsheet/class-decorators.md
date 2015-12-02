@cheatsheetSection
Class decorators
@cheatsheetIndex 4
@description
`import {Directive, ...} from 'angular2/angular2';`

@cheatsheetItem
`@Component({...})
class MyComponent() {}`|`@Component({...})`
Declares that a class is a component and provides metadata about the component.

@cheatsheetItem
`@Pipe({...})
class MyPipe() {}`|`@Pipe({...})`
Declares that a class is a pipe and provides metadata about the pipe.

@cheatsheetItem
`@Injectable()
class MyService() {}`|`@Injectable()`
Declares that a class is capable of being injected.

@cheatsheetItem
`@Inject(...)
class MyService() {}`|`@Injectable()`
Declares that a class has dependencies that should be injected into the constructor when the dependency
injector is creating an instance of this class.
