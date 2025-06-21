# Migration to ngclass to class

This schematic migrates the ngClass to class in your application.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:ngclass-to-class

</docs-code>


#### Before

<docs-code language="angular-html">

<!-- Before -->
<div [ngClass]="{admin: isAdmin, dense: density === 'high'}">

<!-- After -->
<div [class.admin]="isAdmin" [class.dense]="density === 'high'">

</docs-code>
