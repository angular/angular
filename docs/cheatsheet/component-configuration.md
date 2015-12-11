@cheatsheetSection
Component configuration
@cheatsheetIndex 6
@description
`@Component` extends `@Directive`,
so the `@Directive` configuration applies to components as well

@cheatsheetItem
syntax:
`viewProviders: [MyService, provide(...)]`|`viewProviders:`
description:
Array of dependency injection providers scoped to this component's view.


@cheatsheetItem
syntax:
`template: 'Hello {{name}}'
templateUrl: 'my-component.html'`|`template:`|`templateUrl:`
description:
Inline template / external template URL of the component's view.


@cheatsheetItem
syntax:
`styles: ['.primary {color: red}']
styleUrls: ['my-component.css']`|`styles:`|`styleUrls:`
description:
List of inline CSS styles / external stylesheet URLs for styling component’s view.


@cheatsheetItem
syntax:
`directives: [MyDirective, MyComponent]`|`directives:`
description:
List of directives used in the the component’s template.


@cheatsheetItem
syntax:
`pipes: [MyPipe, OtherPipe]`|`pipes:`
description:
List of pipes used in the component's template.
