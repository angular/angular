@cheatsheetSection
Directive and component change detection and lifecycle hooks
@cheatsheetIndex 8
@description
(implemented as class methods)

@cheatsheetItem
syntax:
`constructor(myService: MyService, ...) { ... }`|`constructor(myService: MyService, ...)`
description:
The class constructor is called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.


@cheatsheetItem
syntax:
`ngOnChanges(changeRecord) { ... }`|`ngOnChanges(changeRecord)`
description:
Called after every change to input properties and before processing content or child views.


@cheatsheetItem
syntax:
`ngOnInit() { ... }`|`ngOnInit()`
description:
Called after the constructor, initializing input properties, and the first call to ngOnChanges.


@cheatsheetItem
syntax:
`ngDoCheck() { ... }`|`ngDoCheck()`
description:
Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.


@cheatsheetItem
syntax:
`ngAfterContentInit() { ... }`|`ngAfterContentInit()`
description:
Called after ngOnInit when the component's or directive's content has been initialized.


@cheatsheetItem
syntax:
`ngAfterContentChecked() { ... }`|`ngAfterContentChecked()`
description:
Called after every check of the component's or directive's content.


@cheatsheetItem
syntax:
`ngAfterViewInit() { ... }`|`ngAfterViewInit()`
description:
Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.


@cheatsheetItem
syntax:
`ngAfterViewChecked() { ... }`|`ngAfterViewChecked()`
description:
Called after every check of the component's view. Applies to components only.


@cheatsheetItem
syntax:
`ngOnDestroy() { ... }`|`ngOnDestroy()`
description:
Called once, before the instance is destroyed.