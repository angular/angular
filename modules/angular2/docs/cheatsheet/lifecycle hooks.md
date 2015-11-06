@cheatsheetSection
Directive and component change detection and lifecycle hooks
@cheatsheetIndex 6
@description
(implemented as class methods)

@cheatsheetItem
`constructor(myService: MyService, ...) { ... }`|`constructor(myService: MyService, ...)`
The class constructor is called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.


@cheatsheetItem
`onChanges(changeRecord) { ... }`|`onChanges(changeRecord)`
Called after every change to input properties and before processing content or child views.


@cheatsheetItem
`onInit() { ... }`|`onInit()`
Called after the constructor, initializing input properties, and the first call to onChanges.


@cheatsheetItem
`doCheck() { ... }`|`doCheck()`
Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.


@cheatsheetItem
`afterContentInit() { ... }`|`afterContentInit()`
Called after onInit when the component's or directive's content has been initialized.


@cheatsheetItem
`afterContentChecked() { ... }`|`afterContentChecked()`
Called after every check of the component's or directive's content.


@cheatsheetItem
`afterViewInit() { ... }`|`afterViewInit()`
Called after onContentInit when the component's view has been initialized. Applies to components only.


@cheatsheetItem
`afterViewChecked() { ... }`|`afterViewChecked()`
Called after every check of the component's view. Applies to components only.


@cheatsheetItem
`onDestroy() { ... }`|`onDestroy()`
Called once, before the instance is destroyed.