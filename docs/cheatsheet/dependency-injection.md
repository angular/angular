@cheatsheetSection
Dependency injection configuration
@cheatsheetIndex 9
@description
`import {provide} from 'angular2/angular2';`

@cheatsheetItem
`provide(MyService, {useClass: MyMockService})``provide`|`useClass`
Sets or overrides the provider for MyService to the MyMockService class.


@cheatsheetItem
`provide(MyService, {useFactory: myFactory})``provide`|`useFactory`
Sets or overrides the provider for MyService to the myFactory factory function.


@cheatsheetItem
`provide(MyValue, {useValue: 41})``provide`|`useValue`
Sets or overrides the provider for MyValue to the value 41.

