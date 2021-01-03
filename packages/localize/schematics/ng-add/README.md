# @angular/localize schematic for `ng add`

This schematic will be executed when an Angular CLI user runs `ng add @angular/localize`.

It will search their `angular.json` file, and find polyfills and main files for server builders.
Then it will add the `@angular/localize/init` polyfill that `@angular/localize` needs to work.

If the user specifies that they want to use `$localize` at runtime then the dependency will be
added to the `depdendencies` section of `package.json` rather than in the `devDependencies` which
is the default.