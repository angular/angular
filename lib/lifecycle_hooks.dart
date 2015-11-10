/**
 * @module
 * @description
 * Defines interfaces to be implemented by directives when they need to hook into the change
 * detection mechanism.
 */
library angular2.lifecycle_hooks;

export "src/core/linker/interfaces.dart"
    show
        AfterContentInit,
        AfterContentChecked,
        AfterViewInit,
        AfterViewChecked,
        OnChanges,
        OnDestroy,
        OnInit,
        DoCheck;
