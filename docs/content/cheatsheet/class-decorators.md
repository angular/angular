@cheatsheetSection
Class decorators
@cheatsheetIndex 5
@description
{@target ts}`import { Directive, ... } from '@angular/core';`{@endtarget}
{@target js}Available from the `ng.core` namespace{@endtarget}

@cheatsheetItem
syntax(ts):
`@Component({...})
class MyComponent() {}`|`@Component({...})`
syntax(js):
`var MyComponent = ng.core.Component({...}).Class({...})`|`ng.core.Component({...})`
description:
Declares that a class is a component and provides metadata about the component.

@cheatsheetItem
syntax(ts):
`@Directive({...})
class MyDirective() {}`|`@Directive({...})`
syntax(js):
`var MyDirective = ng.core.Directive({...}).Class({...})`|`ng.core.Directive({...})`
description:
Declares that a class is a directive and provides metadata about the directive.

@cheatsheetItem
syntax(ts):
`@Pipe({...})
class MyPipe() {}`|`@Pipe({...})`
syntax(js):
`var MyPipe = ng.core.Pipe({...}).Class({...})`|`ng.core.Pipe({...})`
description:
Declares that a class is a pipe and provides metadata about the pipe.

@cheatsheetItem
syntax(ts):
`@Injectable()
class MyService() {}`|`@Injectable()`
syntax(js):
`var OtherService = ng.core.Class(
    {constructor: function() { }});
var MyService = ng.core.Class(
    {constructor: [OtherService, function(otherService) { }]});`|`var MyService = ng.core.Class({constructor: [OtherService, function(otherService) { }]});`
description:
{@target ts}Declares that a class has dependencies that should be injected into the constructor when the dependency injector is creating an instance of this class.
{@endtarget}
{@target js}
Declares a service to inject into a class by providing an array with the services, with the final item being the function to receive the injected services.
{@endtarget}
