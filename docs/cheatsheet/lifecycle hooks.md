@cheatsheetSection
Directive and component change detection and lifecycle hooks
@cheatsheetIndex 8
@description
(implemented as class methods)

@cheatsheetItem
`constructor(myService: MyService, ...) { ... }`|`constructor(myService: MyService, ...)`
The class constructor is called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.


@cheatsheetItem
`ngOnChanges(changeRecord) { ... }`|`ngOnChanges(changeRecord)`
Called after every change to input properties and before processing content or child views.


@cheatsheetItem
`ngOnInit() { ... }`|`ngOnInit()`
Called after the constructor, initializing input properties, and the first call to ngOnChanges.


@cheatsheetItem
`ngDoCheck() { ... }`|`ngDoCheck()`
Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.


@cheatsheetItem
`ngAfterContentInit() { ... }`|`ngAfterContentInit()`
Called after ngOnInit when the component's or directive's content has been initialized.


@cheatsheetItem
`ngAfterContentChecked() { ... }`|`ngAfterContentChecked()`
Called after every check of the component's or directive's content.


@cheatsheetItem
`ngAfterViewInit() { ... }`|`ngAfterViewInit()`
Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.


@cheatsheetItem
`ngAfterViewChecked() { ... }`|`ngAfterViewChecked()`
Called after every check of the component's view. Applies to components only.


@cheatsheetItem
`ngOnDestroy() { ... }`|`ngOnDestroy()`
Called once, before the instance is destroyed.