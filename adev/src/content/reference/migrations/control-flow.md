# Migration to Control Flow syntax


[Control flow syntax](guide/templates/control-flow) is available from Angular 17 and simplified way to use the control-flow directives like *ngFor, *ngIf and *ngSwitch. 

The new syntax is baked into the template, so you don't need to import `CommonModule` anymore. But wait there is more to it, there is an migration availble for migrating all your old code to use new Control Flow Syntax with Angular 17 release. Run the schematic with the following command:

<docs-code language="shell">

ng generate @angular/core:control-flow

</docs-code>