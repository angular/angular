@cheatsheetSection Component configuration
@description
`@Component extends @Directive`, so the @Directive configuration applies to components as well)

@cheatsheetItem
`viewProviders: [MyService, provide(...)]`|`viewProviders:`
Array of dependency injection providers scoped to this component's view.


@cheatsheetItem
`template: 'Hello {{name}}'\ntemplateUrl: 'my-component.html'`|`template:`|`templateUrl:`
Inline template / external template url of the component's view.


@cheatsheetItem
`styles: ['.primary {color: red}']\nstyleUrls: ['my-component.css']`|`styles:`|`styleUrls:`
List of inline css styles / external stylesheet urls for styling component’s view.


@cheatsheetItem
`directives: [MyDirective, MyComponent]`|`directives:`
List of directives used in the the component’s template.


@cheatsheetItem
`pipes: [MyPipe, OtherPipe]`|`pipes:`
List of pipes used in the component's template.