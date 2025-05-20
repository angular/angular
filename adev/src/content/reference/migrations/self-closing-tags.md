# Migration to self-closing tags

Self-closing tags are supported in Angular templates since [v16](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d#7065). .

This schematic migrates the templates in your application to use self-closing tags.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:self-closing-tag

</docs-code>


#### Before

<docs-code language="angular-html">

<!-- Before -->
<hello-world></hello-world>

<!-- After -->
<hello-world />

</docs-code>
